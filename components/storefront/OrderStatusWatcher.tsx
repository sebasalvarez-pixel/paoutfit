"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

/**
 * El estado real del pago lo decide el webhook (Addi/Wompi), no el navegador.
 * Mientras el pedido siga pendiente, esta página se vuelve a pedir al servidor
 * cada pocos segundos (máx. ~2 min) para que pase sola a "pagado" o "falló".
 * Cuando el pago queda aprobado, recién ahí se vacía el carrito.
 */
export default function OrderStatusWatcher({ status }: { status: string }) {
  const router = useRouter();
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    if (status === "paid") {
      clear();
      return;
    }
    if (status !== "pending") return;

    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (tries > 30) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, 4000);
    return () => clearInterval(id);
  }, [status, router, clear]);

  return null;
}
