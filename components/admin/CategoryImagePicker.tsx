"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase-browser";
import { compressImage } from "@/lib/image-compress";
import {
  createCategoryImageUploadUrl,
  setCategoryImage,
} from "@/app/admin/categorias/actions";

export type PickerPhoto = { url: string; label: string };

/**
 * Elegir la foto de una categoría (la que sale en su tarjeta del inicio):
 * una de las fotos de los productos, una foto nueva, o "automática".
 */
export function CategoryImagePicker({
  categoryId,
  currentUrl,
  photos,
}: {
  categoryId: string;
  currentUrl: string | null;
  photos: PickerPhoto[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<
    { type: "ok" | "error"; text: string } | null
  >(null);

  async function run(task: () => Promise<{ ok: boolean; error?: string }>, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await task();
      if (!result.ok) throw new Error(result.error ?? "No se pudo guardar.");
      setMessage({ type: "ok", text: okText });
      router.refresh();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "No se pudo guardar.",
      });
    } finally {
      setBusy(false);
    }
  }

  function choosePhoto(url: string) {
    return run(() => setCategoryImage(categoryId, { url }), "✓ Foto de la categoría guardada");
  }

  function useAutomatic() {
    return run(() => setCategoryImage(categoryId, null), "✓ Ahora se elige sola");
  }

  async function uploadNew(rawFile: File) {
    await run(async () => {
      const file = await compressImage(rawFile);
      const prep = await createCategoryImageUploadUrl(categoryId, file.type);
      if (!prep.ok) return prep;
      const { error } = await supabaseBrowser.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .uploadToSignedUrl(prep.storageKey, prep.token, file);
      if (error) return { ok: false, error: `No se pudo subir: ${error.message}` };
      return setCategoryImage(categoryId, { storageKey: prep.storageKey });
    }, "✓ Foto subida y guardada");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-16 bg-blush border border-ink/10 overflow-hidden shrink-0">
          {currentUrl ? (
            <Image src={currentUrl} alt="" fill sizes="64px" className="object-cover object-top" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-ink/40 text-center px-1">
              Automática
            </span>
          )}
        </div>
        <div className="text-xs space-y-1">
          <p className="text-ink/60">Foto de la categoría (tarjeta del inicio)</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-rose hover:underline"
            >
              {open ? "Cerrar" : "Cambiar foto"}
            </button>
            {currentUrl && (
              <button
                type="button"
                onClick={useAutomatic}
                disabled={busy}
                className="text-ink/60 hover:underline disabled:opacity-50"
              >
                Volver a automática
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="border border-ink/10 rounded p-3 space-y-3 bg-ivory">
          <label className="inline-block border border-rose text-rose text-xs px-3 py-2 cursor-pointer hover:bg-rose hover:text-white transition-colors">
            Subir una foto nueva
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadNew(file);
              }}
            />
          </label>

          {photos.length > 0 ? (
            <>
              <p className="text-xs text-ink/50">
                …o elige una de las fotos de tus productos:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {photos.map((photo) => (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => choosePhoto(photo.url)}
                    disabled={busy}
                    title={photo.label}
                    className={`relative aspect-[3/4] overflow-hidden border-2 transition-colors disabled:opacity-50 ${
                      photo.url === currentUrl
                        ? "border-rose"
                        : "border-transparent hover:border-rose/50"
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.label}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-ink/50">
              Todavía no hay fotos de productos para elegir. Sube una nueva.
            </p>
          )}
        </div>
      )}

      {busy && <p className="text-xs text-ink/60">Guardando…</p>}
      {message && (
        <p
          role="status"
          className={`text-xs ${message.type === "ok" ? "text-emerald-700" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
