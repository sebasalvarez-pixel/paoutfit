import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { formatCop } from "@/lib/format";
import {
  FREE_SHIPPING_THRESHOLD_COP,
  NATIONAL_SHIPPING_COP,
} from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Términos y condiciones — PAOUTFIT",
  description:
    "Términos y condiciones de compra en la tienda en línea de PAOUTFIT, conforme al Estatuto del Consumidor (Ley 1480 de 2011).",
};

export default async function TermsPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-sm">
        <p className="bg-blush text-ink/70 text-xs px-4 py-3 not-prose mb-8">
          This is an English translation provided for convenience. The Spanish
          version is the legally binding one under Colombian law.
        </p>
        <h1 className="font-heading text-3xl text-ink mb-2">
          Terms and Conditions
        </h1>
        <p className="text-ink/50 text-sm mb-8">
          Last updated: September 23, 2026
        </p>

        <h2>1. Who we are</h2>
        <p>
          This online store is operated by <strong>PAOUTFIT</strong>, a
          Colombian women&apos;s activewear brand based in Neiva, Huila. Contact:{" "}
          <a href="mailto:paoutfitwear@gmail.com">paoutfitwear@gmail.com</a>.
          By buying on this site you accept these terms.
        </p>

        <h2>2. Products and prices</h2>
        <p>
          Prices are shown in Colombian pesos (COP). Photos are illustrative;
          slight color variations may occur depending on your screen. We may
          correct pricing or stock errors and, if an order cannot be
          fulfilled, we will contact you and refund any amount paid.
        </p>

        <h2>3. Purchase and payment</h2>
        <p>
          Your order is confirmed once the payment is approved by the payment
          provider (Wompi or Addi). Before paying you can see the subtotal, the
          shipping cost and the total. Payments are processed by these
          providers under their own terms; we never store card data.
        </p>
        <p>
          Addi is a credit product offered by a third party. Its approval,
          installments, and conditions are decided by Addi.
        </p>

        <h2>4. Shipping</h2>
        <p>
          National shipping has a flat rate of{" "}
          {formatCop(NATIONAL_SHIPPING_COP)} and is free from{" "}
          {formatCop(FREE_SHIPPING_THRESHOLD_COP)}. International shipping
          (DHL) is quoted per order and confirmed to you before you pay.
          Delivery times are estimates and depend on the carrier. International
          customers are responsible for customs, duties, and import taxes of
          their country, if any. See{" "}
          <Link href="/informacion#envios">Shipping</Link>.
        </p>

        <h2>5. Right of withdrawal, exchanges, and warranty</h2>
        <p>
          Under Colombian Law 1480 of 2011, for distance sales you may
          withdraw within 5 business days after receiving your order, provided
          the product is unused with its original tags and packaging. Legal
          warranty applies to defective products. Details in{" "}
          <Link href="/informacion#cambios">Exchanges and returns</Link>.
        </p>

        <h2>6. Intellectual property</h2>
        <p>
          The PAOUTFIT name, logo, photographs, and content of this site are
          protected. They may not be copied or used without written
          authorization.
        </p>

        <h2>7. Personal data</h2>
        <p>
          We process your data according to our{" "}
          <Link href="/tratamiento-de-datos">Personal Data Processing Policy</Link>
          .
        </p>

        <h2>8. Governing law and claims</h2>
        <p>
          These terms are governed by Colombian law. You may file complaints
          with us at the email above, and with the Superintendencia de
          Industria y Comercio (SIC) as the consumer protection authority.
        </p>

        <h2>9. Changes</h2>
        <p>
          We may update these terms; the version in force is the one published
          on this page when you place your order.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-sm">
      <h1 className="font-heading text-3xl text-ink mb-2">
        Términos y condiciones
      </h1>
      <p className="text-ink/50 text-sm mb-8">
        Última actualización: 23 de septiembre de 2026
      </p>

      <h2>1. Quiénes somos</h2>
      <p>
        Esta tienda en línea es operada por <strong>PAOUTFIT</strong>, marca
        colombiana de ropa deportiva femenina con sede en Neiva, Huila.
        Contacto:{" "}
        <a href="mailto:paoutfitwear@gmail.com">paoutfitwear@gmail.com</a>. Al
        comprar en este sitio aceptas estos términos.
      </p>

      <h2>2. Productos y precios</h2>
      <p>
        Los precios se muestran en pesos colombianos (COP). Las fotos son
        ilustrativas; pueden existir leves variaciones de color según tu
        pantalla. Podemos corregir errores de precio o inventario y, si un
        pedido no se puede cumplir, te contactaremos y te devolveremos lo
        pagado.
      </p>

      <h2>3. Compra y pago</h2>
      <p>
        Tu pedido queda confirmado cuando el pago es aprobado por la pasarela
        (Wompi o Addi). Antes de pagar puedes ver el subtotal, el costo del
        envío y el total. Los pagos los procesan estos proveedores bajo sus
        propios términos; nosotros nunca almacenamos datos de tarjetas.
      </p>
      <p>
        Addi es un producto de crédito ofrecido por un tercero. La
        aprobación, las cuotas y las condiciones las define Addi.
      </p>

      <h2>4. Envíos</h2>
      <p>
        El envío nacional tiene una tarifa fija de{" "}
        {formatCop(NATIONAL_SHIPPING_COP)} y es gratis desde{" "}
        {formatCop(FREE_SHIPPING_THRESHOLD_COP)}. El envío internacional (DHL)
        se cotiza por pedido y te lo confirmamos antes de que pagues. Los
        tiempos de entrega son estimados y dependen de la transportadora. En
        envíos internacionales, los aranceles, impuestos de importación y
        trámites aduaneros de tu país, si los hay, corren por tu cuenta.
        Consulta{" "}
        <Link href="/informacion#envios">Envíos</Link>.
      </p>

      <h2>5. Retracto, cambios y garantía</h2>
      <p>
        Conforme a la Ley 1480 de 2011 (Estatuto del Consumidor), en ventas a
        distancia puedes retractarte dentro de los 5 días hábiles siguientes a
        recibir tu pedido, siempre que el producto no haya sido usado y
        conserve etiquetas y empaques. La garantía legal aplica a productos
        defectuosos. Detalles en{" "}
        <Link href="/informacion#cambios">Cambios y devoluciones</Link>.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        El nombre PAOUTFIT, el logo, las fotografías y los contenidos de este
        sitio están protegidos. No pueden copiarse ni usarse sin autorización
        escrita.
      </p>

      <h2>7. Datos personales</h2>
      <p>
        Tratamos tus datos conforme a nuestra{" "}
        <Link href="/tratamiento-de-datos">
          Política de tratamiento de datos personales
        </Link>
        .
      </p>

      <h2>8. Ley aplicable y reclamos</h2>
      <p>
        Estos términos se rigen por la ley colombiana. Puedes presentar tus
        quejas o reclamos a nuestro correo y, como autoridad de protección al
        consumidor, ante la Superintendencia de Industria y Comercio (SIC).
      </p>

      <h2>9. Cambios</h2>
      <p>
        Podemos actualizar estos términos; aplica la versión publicada en esta
        página al momento de hacer tu pedido.
      </p>
    </div>
  );
}
