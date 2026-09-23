"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase-browser";
import { compressImage } from "@/lib/image-compress";
import {
  createImageUploadUrl,
  confirmImageUploads,
} from "@/app/admin/productos/[id]/actions";

type RowStatus = "queued" | "working" | "uploaded" | "error";

type Row = {
  id: string;
  file: File;
  previewUrl: string;
  variantId: string;
  status: RowStatus;
  storageKey?: string;
  error?: string;
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
// Cuántas fotos se comprimen y suben al mismo tiempo: suficiente para ir
// rápido sin saturar el celular ni la conexión.
const CONCURRENCY = 3;

const STATUS_TEXT: Record<RowStatus, string> = {
  queued: "En espera",
  working: "Subiendo…",
  uploaded: "Lista ✓",
  error: "Error",
};

export function UploadImageForm({
  productId,
  variants,
}: {
  productId: string;
  variants: { id: string; colorName: string }[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [defaultVariantId, setDefaultVariantId] = useState(variants[0]?.id ?? "");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<
    { type: "error" | "success"; text: string } | null
  >(null);

  // Libera las vistas previas al salir de la página.
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  useEffect(
    () => () => rowsRef.current.forEach((r) => URL.revokeObjectURL(r.previewUrl)),
    [],
  );

  function patchRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addFiles(fileList: FileList | File[]) {
    setMessage(null);
    const incoming = Array.from(fileList);
    const valid = incoming.filter((f) => ACCEPTED.includes(f.type));
    if (valid.length < incoming.length) {
      setMessage({
        type: "error",
        text: "Se ignoraron archivos que no son JPG, PNG o WEBP.",
      });
    }
    setRows((prev) => [
      ...prev,
      ...valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        variantId: defaultVariantId,
        status: "queued" as RowStatus,
      })),
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (row) URL.revokeObjectURL(row.previewUrl);
      return prev.filter((r) => r.id !== id);
    });
  }

  // Aplica un color a todas las fotos que aún no se han subido.
  function applyColorToAll(variantId: string) {
    setDefaultVariantId(variantId);
    setRows((prev) =>
      prev.map((r) => (r.status === "uploaded" ? r : { ...r, variantId })),
    );
  }

  async function uploadOne(row: Row): Promise<Row> {
    patchRow(row.id, { status: "working", error: undefined });
    try {
      const file = await compressImage(row.file);
      const prep = await createImageUploadUrl(productId, file.name, file.type);
      if (!prep.ok) throw new Error(prep.error);

      const { error } = await supabaseBrowser.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .uploadToSignedUrl(prep.storageKey, prep.token, file);
      if (error) throw new Error(error.message);

      patchRow(row.id, { status: "uploaded", storageKey: prep.storageKey });
      return { ...row, status: "uploaded", storageKey: prep.storageKey };
    } catch (e) {
      const text = e instanceof Error ? e.message : "No se pudo subir.";
      patchRow(row.id, { status: "error", error: text });
      return { ...row, status: "error", error: text };
    }
  }

  async function handleUpload() {
    const todo = rows.filter((r) => r.status === "queued" || r.status === "error");
    if (todo.length === 0 || busy) return;
    if (todo.some((r) => !r.variantId)) {
      setMessage({ type: "error", text: "Elige el color de cada foto." });
      return;
    }

    setBusy(true);
    setMessage(null);

    // Piscina de subidas en paralelo; se conserva el orden original al final.
    const results = new Map<string, Row>();
    let next = 0;
    const workers = Array.from({ length: Math.min(CONCURRENCY, todo.length) }, async () => {
      while (next < todo.length) {
        const row = todo[next++];
        results.set(row.id, await uploadOne(row));
      }
    });
    await Promise.all(workers);

    // Las que ya estaban subidas de un intento anterior también se registran.
    const toConfirm = rows
      .filter((r) => r.status === "uploaded" || results.get(r.id)?.status === "uploaded")
      .map((r) => results.get(r.id) ?? r)
      .filter((r) => r.storageKey)
      .map((r) => ({ variantId: r.variantId, storageKey: r.storageKey! }));

    const failed = todo.filter((r) => results.get(r.id)?.status === "error").length;

    if (toConfirm.length > 0) {
      const confirmed = await confirmImageUploads(productId, toConfirm);
      if (!confirmed.ok) {
        setMessage({ type: "error", text: confirmed.error });
        setBusy(false);
        return;
      }
      // Quita de la lista las fotos ya guardadas; las fallidas se quedan para reintentar.
      setRows((prev) => {
        prev
          .filter((r) => r.status === "uploaded")
          .forEach((r) => URL.revokeObjectURL(r.previewUrl));
        return prev.filter((r) => r.status !== "uploaded");
      });
      router.refresh();
    }

    setMessage(
      failed === 0
        ? {
            type: "success",
            text: `¡${toConfirm.length} foto${toConfirm.length === 1 ? "" : "s"} subida${toConfirm.length === 1 ? "" : "s"} correctamente!`,
          }
        : {
            type: "error",
            text: `${toConfirm.length} subida(s), ${failed} con error. Revisa las marcadas y pulsa "Subir" para reintentar.`,
          },
    );
    setBusy(false);
  }

  const pendingCount = rows.filter((r) => r.status !== "uploaded").length;
  const doneCount = rows.filter((r) => r.status === "uploaded").length;
  const progress = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;

  return (
    <div className="bg-white border border-ink/10 rounded p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-ink/60">Color para las fotos nuevas</label>
          <select
            value={defaultVariantId}
            onChange={(e) => applyColorToAll(e.target.value)}
            disabled={busy}
            className="block border border-ink/20 px-2 py-2 mt-1 text-sm"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.colorName}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-ink/50 pb-2">
          Puedes cambiar el color de cada foto en la lista.
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded px-4 py-8 text-center cursor-pointer transition-colors ${
          dragging ? "border-rose bg-blush" : "border-ink/20 hover:border-rose/60"
        }`}
      >
        <span className="text-sm text-ink">
          Toca para elegir varias fotos o arrástralas aquí
        </span>
        <span className="text-xs text-ink/50">JPG, PNG o WEBP · se achican solas al subirlas</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            // Permite volver a elegir el mismo archivo después.
            e.target.value = "";
          }}
        />
      </label>

      {rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 border border-ink/10 rounded p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.previewUrl}
                alt=""
                className="h-14 w-11 object-cover rounded shrink-0 bg-blush"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink truncate">{row.file.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <select
                    value={row.variantId}
                    onChange={(e) => patchRow(row.id, { variantId: e.target.value })}
                    disabled={busy || row.status === "uploaded"}
                    aria-label="Color de la foto"
                    className="border border-ink/20 px-1.5 py-1 text-xs"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.colorName}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`text-xs ${
                      row.status === "error"
                        ? "text-red-600"
                        : row.status === "uploaded"
                          ? "text-green-700"
                          : "text-ink/50"
                    }`}
                  >
                    {row.status === "error" && row.error
                      ? `Error: ${row.error}`
                      : STATUS_TEXT[row.status]}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={busy && row.status === "working"}
                aria-label="Quitar foto"
                className="text-ink/40 hover:text-red-600 px-2 py-1 disabled:opacity-30"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {busy && (
        <div>
          <div className="h-2 w-full bg-ink/10 rounded overflow-hidden">
            <div
              className="h-full bg-rose transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-ink/60 mt-1">
            {doneCount} de {rows.length} listas…
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={busy || pendingCount === 0}
          className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors disabled:opacity-50"
        >
          {busy
            ? "Subiendo…"
            : pendingCount > 0
              ? `Subir ${pendingCount} foto${pendingCount === 1 ? "" : "s"}`
              : "Subir"}
        </button>
        {message && (
          <p
            className={`text-xs ${
              message.type === "error" ? "text-red-600" : "text-green-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
