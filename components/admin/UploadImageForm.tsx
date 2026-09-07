"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase-browser";
import { compressImage } from "@/lib/image-compress";
import { createImageUploadUrl, confirmImageUpload } from "@/app/admin/productos/[id]/actions";

export function UploadImageForm({
  productId,
  variants,
}: {
  productId: string;
  variants: { id: string; colorName: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<
    { type: "idle" } | { type: "error"; message: string } | { type: "success" }
  >({ type: "idle" });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ type: "idle" });
    const formData = new FormData(e.currentTarget);
    const rawFile = formData.get("file") as File | null;
    const variantId = String(formData.get("variantId") || "") || null;

    if (!rawFile || rawFile.size === 0) {
      setStatus({ type: "error", message: "Selecciona una foto." });
      return;
    }

    startTransition(async () => {
      const file = await compressImage(rawFile);

      const prep = await createImageUploadUrl(productId, file.name, file.type);
      if (!prep.ok) {
        setStatus({ type: "error", message: prep.error });
        return;
      }

      const { error: uploadError } = await supabaseBrowser.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .uploadToSignedUrl(prep.storageKey, prep.token, file);
      if (uploadError) {
        setStatus({ type: "error", message: `No se pudo subir la foto: ${uploadError.message}` });
        return;
      }

      const result = await confirmImageUpload(productId, variantId, prep.storageKey);
      if (!result.ok) {
        setStatus({ type: "error", message: result.error });
        return;
      }

      formRef.current?.reset();
      setStatus({ type: "success" });
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-white border border-ink/10 rounded p-4 flex flex-wrap items-end gap-4"
    >
      <div>
        <label className="text-xs text-ink/60">Color (opcional)</label>
        <select
          name="variantId"
          defaultValue=""
          className="border border-ink/20 px-2 py-2 mt-1 text-sm"
        >
          <option value="">General del producto</option>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.colorName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-ink/60">Archivo</label>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="block text-sm mt-1"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-rose text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-plum transition-colors disabled:opacity-50"
      >
        {isPending ? "Subiendo..." : "Subir"}
      </button>
      {status.type === "error" && (
        <p className="w-full text-xs text-red-600">{status.message}</p>
      )}
      {status.type === "success" && (
        <p className="w-full text-xs text-green-700">¡Foto subida correctamente!</p>
      )}
    </form>
  );
}
