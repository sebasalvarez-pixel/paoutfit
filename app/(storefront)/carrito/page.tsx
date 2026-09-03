"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatCop } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCartStore();
  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-heading text-3xl text-ink mb-4">
          Tu carrito está vacío
        </h1>
        <Link
          href="/coleccion/vestidos"
          className="inline-block bg-rose text-white px-8 py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors"
        >
          Ver colección
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <h1 className="font-heading text-3xl text-ink mb-8">Tu carrito</h1>
        <ul className="divide-y divide-ink/10">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-6">
              <div className="relative h-28 w-24 bg-blush shrink-0 overflow-hidden">
                {item.imageSrc && (
                  <Image
                    src={item.imageSrc}
                    alt={item.productTitle}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="uppercase tracking-wide text-sm">
                  {item.productTitle}
                </p>
                <p className="text-xs text-ink/60 mt-1">
                  Color: {item.colorName}
                </p>
                <p className="text-rose mt-1">{formatCop(item.unitPriceCop)}</p>
                <div className="flex items-center gap-4 mt-3">
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.variantId, Number(e.target.value))
                    }
                    className="border border-ink/20 text-sm px-2 py-1"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs text-ink/50 hover:text-rose underline"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blush p-6 h-fit">
        <h2 className="font-heading text-xl mb-4">Resumen</h2>
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>{formatCop(total)}</span>
        </div>
        <p className="text-xs text-ink/60 mb-4">
          El envío se calcula en el siguiente paso.
        </p>
        <Link
          href="/checkout"
          className="block text-center bg-rose text-white py-3 uppercase text-sm tracking-wide hover:bg-plum transition-colors"
        >
          Finalizar compra
        </Link>
      </div>
    </div>
  );
}
