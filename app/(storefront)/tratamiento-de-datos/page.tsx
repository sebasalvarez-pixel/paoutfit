import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/get-locale";

export const metadata: Metadata = {
  title: "Tratamiento de datos personales — PAOUTFIT",
  description:
    "Política de tratamiento de datos personales de PAOUTFIT, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.",
};

export default async function DataPolicyPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-sm">
        <p className="bg-blush text-ink/70 text-xs px-4 py-3 not-prose mb-8">
          This is an English translation provided for convenience. The
          Spanish version is the legally binding one under Colombian law.
        </p>
        <h1 className="font-heading text-3xl text-ink mb-2">
          Personal Data Processing Policy
        </h1>
        <p className="text-ink/50 text-sm mb-8">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <p>
          In compliance with Colombian Law 1581 of 2012, Decree 1377 of 2013,
          and other applicable regulations on personal data protection,{" "}
          <strong>PAOUTFIT</strong> discloses its policy for the collection,
          use, storage, and processing of the personal data of its customers
          and visitors.
        </p>

        <h2>1. Data controller</h2>
        <p>
          PAOUTFIT (&quot;the brand&quot;), reachable at{" "}
          <a href="mailto:paoutfitwear@gmail.com">paoutfitwear@gmail.com</a>{" "}
          and on Instagram{" "}
          <a
            href="https://instagram.com/paoutfit.col"
            target="_blank"
            rel="noreferrer"
          >
            @paoutfit.col
          </a>
          , is responsible for processing the personal data collected through
          this website.
        </p>

        <h2>2. Data we collect</h2>
        <ul>
          <li>
            <strong>Identification and contact data:</strong> name, email
            address, phone number.
          </li>
          <li>
            <strong>Shipping data:</strong> address, city, and department/state.
          </li>
          <li>
            <strong>Purchase data:</strong> products purchased, amounts, order
            history.
          </li>
          <li>
            <strong>Browsing data:</strong> where you came from (e.g. a social
            network or an ad), for internal statistical purposes only.
          </li>
        </ul>
        <p>
          PAOUTFIT <strong>does not store credit or debit card data</strong>.
          Payments are processed directly through certified payment gateways
          (Wompi and/or Addi), who are responsible for the secure handling of
          that information under their own policies.
        </p>

        <h2>3. Purpose of processing</h2>
        <ul>
          <li>Process, confirm, and ship your orders.</li>
          <li>Communicate with you about the status of your purchase and shipment.</li>
          <li>
            Send you news, promotions, and discounts by email, if you
            authorized it.
          </li>
          <li>Comply with applicable legal, accounting, and tax obligations.</li>
          <li>Improve our website and customer service.</li>
        </ul>

        <h2>4. Who we share your data with</h2>
        <p>
          We only share the data strictly necessary with third parties that
          help us operate the store:
        </p>
        <ul>
          <li>
            <strong>Payment gateways</strong> (Wompi, Addi) — to process your
            payment securely.
          </li>
          <li>
            <strong>Carrier</strong> (by default, ENVIA) — to deliver your
            order.
          </li>
          <li>
            <strong>Transactional email provider</strong> — to send you order
            confirmations and updates.
          </li>
        </ul>
        <p>We do not sell or rent your personal data to third parties.</p>

        <h2>5. Your rights (Habeas Data)</h2>
        <p>As the owner of your personal data, you have the right to:</p>
        <ul>
          <li>Know, update, and correct your personal data.</li>
          <li>Request proof of the authorization granted for the processing of your data.</li>
          <li>Be informed about how your personal data has been used.</li>
          <li>
            Revoke your authorization and/or request the deletion of your
            data, when no legal or contractual duty prevents it.
          </li>
          <li>
            File complaints with Colombia&apos;s Superintendencia de
            Industria y Comercio for violations of data protection law.
          </li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:paoutfitwear@gmail.com">paoutfitwear@gmail.com</a>{" "}
          and we will handle your request within the terms established by
          law.
        </p>

        <h2>6. Information security</h2>
        <p>
          PAOUTFIT adopts reasonable technical and organizational measures to
          protect your personal data against loss, misuse, unauthorized
          access, alteration, or disclosure.
        </p>

        <h2>7. Retention period</h2>
        <p>
          Your personal data will be kept for as long as necessary to fulfill
          the purposes described and applicable legal obligations (for
          example, accounting and tax obligations).
        </p>

        <h2>8. Acceptance</h2>
        <p>
          By making a purchase or registering your email on this site, you
          freely, previously, expressly, and knowingly accept this personal
          data processing policy.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 prose prose-sm">
      <h1 className="font-heading text-3xl text-ink mb-2">
        Política de tratamiento de datos personales
      </h1>
      <p className="text-ink/50 text-sm mb-8">
        Última actualización: {new Date().toLocaleDateString("es-CO")}
      </p>

      <p>
        En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y
        demás normas que las modifiquen o complementen sobre protección de
        datos personales en Colombia, <strong>PAOUTFIT</strong> informa su
        política para la recolección, uso, almacenamiento y tratamiento de
        los datos personales de sus clientes y visitantes.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        PAOUTFIT (en adelante, &quot;la marca&quot;), con contacto a través
        de{" "}
        <a href="mailto:paoutfitwear@gmail.com">paoutfitwear@gmail.com</a> e
        Instagram{" "}
        <a
          href="https://instagram.com/paoutfit.col"
          target="_blank"
          rel="noreferrer"
        >
          @paoutfit.col
        </a>
        , es responsable del tratamiento de los datos personales recolectados
        a través de este sitio web.
      </p>

      <h2>2. Datos que recolectamos</h2>
      <ul>
        <li>
          <strong>Datos de identificación y contacto:</strong> nombre,
          correo electrónico, número de teléfono.
        </li>
        <li>
          <strong>Datos de envío:</strong> dirección, ciudad y departamento.
        </li>
        <li>
          <strong>Datos de la compra:</strong> productos adquiridos, valores,
          historial de pedidos.
        </li>
        <li>
          <strong>Datos de navegación:</strong> de dónde llegaste al sitio
          (por ejemplo, una red social o un anuncio), únicamente con fines
          estadísticos internos.
        </li>
      </ul>
      <p>
        PAOUTFIT <strong>no almacena datos de tarjetas de crédito o débito</strong>
        . Los pagos se procesan directamente a través de pasarelas de pago
        certificadas (Wompi y/o Addi), quienes son responsables del manejo
        seguro de esa información conforme a sus propias políticas.
      </p>

      <h2>3. Finalidad del tratamiento</h2>
      <ul>
        <li>Procesar, confirmar y despachar tus pedidos.</li>
        <li>Comunicarnos contigo sobre el estado de tu compra y envío.</li>
        <li>
          Enviarte, si lo autorizaste, novedades, promociones y descuentos
          por correo electrónico.
        </li>
        <li>
          Cumplir con obligaciones legales, contables y fiscales aplicables.
        </li>
        <li>Mejorar nuestro sitio y nuestra atención al cliente.</li>
      </ul>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>
        Solo compartimos los datos estrictamente necesarios con terceros que
        nos ayudan a operar la tienda:
      </p>
      <ul>
        <li>
          <strong>Pasarelas de pago</strong> (Wompi, Addi) — para procesar tu
          pago de forma segura.
        </li>
        <li>
          <strong>Transportadora</strong> (por defecto, ENVIA) — para
          entregar tu pedido.
        </li>
        <li>
          <strong>Proveedor de correo transaccional</strong> — para enviarte
          confirmaciones y actualizaciones de tu pedido.
        </li>
      </ul>
      <p>No vendemos ni alquilamos tus datos personales a terceros.</p>

      <h2>5. Tus derechos (Habeas Data)</h2>
      <p>Como titular de tus datos personales, tienes derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos personales.</li>
        <li>
          Solicitar prueba de la autorización otorgada para el tratamiento
          de tus datos.
        </li>
        <li>
          Ser informado sobre el uso que se le ha dado a tus datos
          personales.
        </li>
        <li>
          Revocar la autorización y/o solicitar la supresión de tus datos,
          cuando no exista un deber legal o contractual que lo impida.
        </li>
        <li>
          Presentar quejas ante la Superintendencia de Industria y Comercio
          por infracciones a la ley de protección de datos.
        </li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escríbenos a{" "}
        <a href="mailto:paoutfitwear@gmail.com">paoutfitwear@gmail.com</a> y
        atenderemos tu solicitud dentro de los términos establecidos por la
        ley.
      </p>

      <h2>6. Seguridad de la información</h2>
      <p>
        PAOUTFIT adopta medidas técnicas y organizativas razonables para
        proteger tus datos personales contra pérdida, uso indebido, acceso
        no autorizado, alteración o divulgación.
      </p>

      <h2>7. Vigencia</h2>
      <p>
        Tus datos personales se conservarán durante el tiempo necesario para
        cumplir con las finalidades descritas y con las obligaciones legales
        aplicables (por ejemplo, contables y tributarias).
      </p>

      <h2>8. Aceptación</h2>
      <p>
        Al realizar una compra o registrar tu correo en este sitio, aceptas
        de forma libre, previa, expresa e informada esta política de
        tratamiento de datos personales.
      </p>
    </div>
  );
}
