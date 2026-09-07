"use client";

import { useRef, useState, useTransition } from "react";
import { addVariant } from "@/app/admin/productos/[id]/actions";

export function AddVariantForm({
  productId,
  defaultPriceCop,
}: {
  productId: string;
  defaultPriceCop: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addVariant(productId, formData);
      if (!result.ok) {
        setError(result.error ?? "Ocurrió un error inesperado.");
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-blush p-4 flex flex-wrap items-end gap-4"
    >
      <div>
        <label className="text-xs text-ink/60">Nuevo color</label>
        <input
          name="colorName"
          required
          placeholder="Ej. Verde militar"
          className="border border-ink/20 px-3 py-2 text-sm mt-1"
        />
      </div>
      <div>
        <label className="text-xs text-ink/60">Precio (COP)</label>
        <input
          name="priceCop"
          type="number"
          defaultValue={defaultPriceCop}
          required
          className="w-32 border border-ink/20 px-2 py-2 text-sm mt-1"
        />
      </div>
      <div>
        <label className="text-xs text-ink/60">Inventario inicial</label>
        <input
          name="inventoryQty"
          type="number"
          defaultValue={0}
          className="w-24 border border-ink/20 px-2 py-2 text-sm mt-1"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-white px-6 py-2 text-sm uppercase tracking-wide hover:bg-rose transition-colors disabled:opacity-60"
      >
        {isPending ? "Agregando..." : "Agregar color"}
      </button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </form>
  );
}
