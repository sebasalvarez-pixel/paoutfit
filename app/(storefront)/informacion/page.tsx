import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";

export const metadata: Metadata = {
  title: "Información — PAOUTFIT",
  description:
    "Envíos, pagos, cambios y devoluciones, guía de tallas y contacto de PAOUTFIT.",
};

const SECTIONS_ES = [
  { id: "envios", label: "Envíos" },
  { id: "pagos", label: "Métodos de pago" },
  { id: "cambios", label: "Cambios y devoluciones" },
  { id: "tallas", label: "Guía de tallas" },
  { id: "contacto", label: "Contacto" },
  { id: "faq", label: "Preguntas frecuentes" },
];

const SECTIONS_EN = [
  { id: "envios", label: "Shipping" },
  { id: "pagos", label: "Payment methods" },
  { id: "cambios", label: "Exchanges & returns" },
  { id: "tallas", label: "Size guide" },
  { id: "contacto", label: "Contact" },
  { id: "faq", label: "FAQ" },
];

export default async function InfoPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-heading text-4xl text-ink text-center mb-4">
          Information
        </h1>
        <p className="text-center text-ink/60 mb-10 max-w-lg mx-auto">
          Everything you need to know before and after your purchase.
        </p>

        <nav className="flex flex-wrap justify-center gap-2 mb-14">
          {SECTIONS_EN.map((s) => (
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
          <h2 className="font-heading text-2xl text-ink mb-4">🚚 Shipping</h2>
          <div className="space-y-3 text-sm text-ink/80">
            <p>
              All our shipments are made through <strong>ENVIA</strong>{" "}
              nationwide within Colombia.
            </p>
            <p>
              Once your payment is confirmed, we prepare your order and ship
              it within <strong>1 to 2 business days</strong>. The carrier's
              delivery time is usually an additional{" "}
              <strong>2 to 5 business days</strong>, depending on your city.
            </p>
            <p>
              We'll email you when your order ships, with your tracking
              number. You can also check your order status anytime on{" "}
              <Link href="/rastrear-pedido" className="text-rose underline">
                Track your order
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="pagos" className="scroll-mt-24 mb-14">
          <h2 className="font-heading text-2xl text-ink mb-4">
            💳 Payment methods
          </h2>
          <div className="space-y-3 text-sm text-ink/80">
            <p>We accept the following 100% secure payment methods:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Credit and debit cards, through Wompi.</li>
              <li>PSE (bank transfer), through Wompi.</li>
              <li>Buy now, pay later, with Addi.</li>
            </ul>
            <p className="text-ink/50">
              We never store your card details — payment is processed
              directly by the corresponding payment gateway.
            </p>
          </div>
        </section>

        <section id="cambios" className="scroll-mt-24 mb-14">
          <h2 className="font-heading text-2xl text-ink mb-4">
            🔄 Exchanges & returns
          </h2>
          <div className="space-y-3 text-sm text-ink/80">
            <p>
              <strong>Right of withdrawal:</strong> under Colombia's Consumer
              Protection Statute (Law 1480 of 2011), you have up to{" "}
              <strong>5 business days</strong> after receiving your order to
              withdraw from the purchase, provided the product hasn't been
              used and keeps its original packaging and tags.
            </p>
            <p>
              <strong>Size or color exchanges:</strong> you have up to{" "}
              <strong>10 calendar days</strong> after receiving your order to
              request an exchange, subject to inventory availability.
            </p>
            <p>
              To start an exchange or return, message us on WhatsApp or
              Instagram with your order number and the reason.
            </p>
          </div>
        </section>

        <section id="tallas" className="scroll-mt-24 mb-14">
          <h2 className="font-heading text-2xl text-ink mb-4">📏 Size guide</h2>
          <div className="space-y-3 text-sm text-ink/80">
            <p>
              Most of our pieces are <strong>one size</strong>, designed with
              stretchy fabrics that fit comfortably from an XS to an L. If
              you're unsure whether a piece will fit you, message us before
              buying — we're happy to help.
            </p>
          </div>
        </section>

        <section id="contacto" className="scroll-mt-24 mb-14">
          <h2 className="font-heading text-2xl text-ink mb-4">📩 Contact</h2>
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
              Email:{" "}
              <a href="mailto:paoutfitwear@gmail.com" className="text-rose underline">
                paoutfitwear@gmail.com
              </a>
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24">
          <h2 className="font-heading text-2xl text-ink mb-4">❓ FAQ</h2>
          <div className="space-y-6 text-sm">
            <div>
              <p className="font-medium text-ink">
                Can I change my address after buying?
              </p>
              <p className="text-ink/70 mt-1">
                Yes, as long as your order hasn't shipped yet. Message us as
                soon as possible on WhatsApp with your order number.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">Do you ship internationally?</p>
              <p className="text-ink/70 mt-1">
                Right now we only ship within Colombia.
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">
                How do I know my payment went through?
              </p>
              <p className="text-ink/70 mt-1">
                You'll get a confirmation email as soon as the payment is
                approved. You can also check the status on{" "}
                <Link href="/rastrear-pedido" className="text-rose underline">
                  Track your order
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-ink/40 mt-16">
          Also check our{" "}
          <Link href="/tratamiento-de-datos" className="underline">
            personal data processing policy
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-4xl text-ink text-center mb-4">
        Información
      </h1>
      <p className="text-center text-ink/60 mb-10 max-w-lg mx-auto">
        Todo lo que necesitas saber antes y después de tu compra.
      </p>

      <nav className="flex flex-wrap justify-center gap-2 mb-14">
        {SECTIONS_ES.map((s) => (
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
