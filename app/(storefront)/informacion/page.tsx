import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Información — PAOUTFIT",
  description:
    "Envíos, pagos, cambios y devoluciones, guía de tallas y contacto de PAOUTFIT.",
};

const SECTIONS = [
  { id: "envios", label: "Envíos" },
  { id: "pagos", label: "Métodos de pago" },
  { id: "cambios", label: "Cambios y devoluciones" },
  { id: "tallas", label: "Guía de tallas" },
  { id: "contacto", label: "Contacto" },
  { id: "faq", label: "Preguntas frecuentes" },
];

export default function InfoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-4xl text-ink text-center mb-4">
        Información
      </h1>
      <p className="text-center text-ink/60 mb-10 max-w-lg mx-auto">
        Todo lo que necesitas saber antes y después de tu compra.
      </p>

      <nav className="flex flex-wrap justify-center gap-2 mb-14">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-xs uppercase tracking-wide border border-ink/20 px-3 py-2 hover:border-rose hover:text-rose transition-colors"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="envios" className="scroll-mt-24 mb-14">
        <h2 className="font-heading text-2xl text-ink mb-4">🚚 Envíos</h2>
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            Todos nuestros envíos se realizan a través de{" "}
            <strong>ENVIA</strong> a nivel nacional en Colombia.
          </p>
          <p>
            Una vez tu pago sea confirmado, alistamos tu pedido y lo
            despachamos en un plazo de <strong>1 a 2 días hábiles</strong>.
            El tiempo de entrega de la transportadora suele ser de{" "}
            <strong>2 a 5 días hábiles</strong> adicionales, dependiendo de
            tu ciudad.
          </p>
          <p>
            Te avisaremos por correo cuando tu pedido sea despachado, con tu
            número de guía. También puedes consultar el estado de tu pedido
            en cualquier momento en{" "}
            <Link href="/rastrear-pedido" className="text-rose underline">
              Rastrea tu pedido
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="pagos" className="scroll-mt-24 mb-14">
        <h2 className="font-heading text-2xl text-ink mb-4">
          💳 Métodos de pago
        </h2>
        <div className="space-y-3 text-sm text-ink/80">
          <p>Aceptamos los siguientes medios de pago, 100% seguros:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tarjetas de crédito y débito, a través de Wompi.</li>
            <li>PSE (pago desde tu cuenta bancaria), a través de Wompi.</li>
            <li>Compra ahora, paga después, con Addi.</li>
          </ul>
          <p className="text-ink/50">
            Nunca almacenamos los datos de tu tarjeta — el pago se procesa
            directamente en la pasarela correspondiente.
          </p>
        </div>
      </section>

      <section id="cambios" className="scroll-mt-24 mb-14">
        <h2 className="font-heading text-2xl text-ink mb-4">
          🔄 Cambios y devoluciones
        </h2>
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            <strong>Derecho de retracto:</strong> conforme al Estatuto del
            Consumidor colombiano (Ley 1480 de 2011), tienes hasta{" "}
            <strong>5 días hábiles</strong> después de recibir tu pedido
            para desistir de la compra, siempre que el producto no haya sido
            usado y conserve sus empaques y etiquetas originales.
          </p>
          <p>
            <strong>Cambios por talla o color:</strong> tienes hasta{" "}
            <strong>10 días calendario</strong> después de recibir tu pedido
            para solicitar un cambio, sujeto a disponibilidad de inventario.
          </p>
          <p>
            Para iniciar un cambio o devolución, escríbenos por WhatsApp o
            Instagram con tu número de pedido y el motivo.
          </p>
        </div>
      </section>

      <section id="tallas" className="scroll-mt-24 mb-14">
        <h2 className="font-heading text-2xl text-ink mb-4">
          📏 Guía de tallas
        </h2>
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            La mayoría de nuestras prendas son de <strong>talla única</strong>,
            diseñadas con telas elásticas que se ajustan cómodamente desde
            una talla XS hasta L. Si tienes dudas sobre si una prenda te
            quedará bien, escríbenos antes de comprar — con gusto te
            asesoramos.
          </p>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-24 mb-14">
        <h2 className="font-heading text-2xl text-ink mb-4">📩 Contacto</h2>
        <div className="space-y-2 text-sm text-ink/80">
          <p>
            WhatsApp:{" "}
            <a
              href="https://wa.me/573114857551"
              target="_blank"
              rel="noreferrer"
              className="text-rose underline"
            >
              +57 311 485 7551
            </a>
          </p>
          <p>
            Instagram:{" "}
            <a
              href="https://instagram.com/paoutfit.col"
              target="_blank"
              rel="noreferrer"
              className="text-rose underline"
            >
              @paoutfit.col
            </a>
          </p>
          <p>
            Correo:{" "}
            <a href="mailto:paoutfitwear@gmail.com" className="text-rose underline">
              paoutfitwear@gmail.com
            </a>
          </p>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24">
        <h2 className="font-heading text-2xl text-ink mb-4">
          ❓ Preguntas frecuentes
        </h2>
        <div className="space-y-6 text-sm">
          <div>
            <p className="font-medium text-ink">
              ¿Puedo cambiar mi dirección después de comprar?
            </p>
            <p className="text-ink/70 mt-1">
              Sí, siempre que tu pedido aún no haya sido despachado.
              Escríbenos lo antes posible por WhatsApp con tu número de
              pedido.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">
              ¿Hacen envíos internacionales?
            </p>
            <p className="text-ink/70 mt-1">
              Por ahora solo realizamos envíos dentro de Colombia.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">
              ¿Cómo sé que mi pago fue exitoso?
            </p>
            <p className="text-ink/70 mt-1">
              Te llega un correo de confirmación apenas se apruebe el pago.
              También puedes revisar el estado en{" "}
              <Link href="/rastrear-pedido" className="text-rose underline">
                Rastrea tu pedido
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-ink/40 mt-16">
        Consulta también nuestra{" "}
        <Link href="/tratamiento-de-datos" className="underline">
          política de tratamiento de datos personales
        </Link>
        .
      </p>
    </div>
  );
}
