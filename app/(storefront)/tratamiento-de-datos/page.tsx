import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tratamiento de datos personales — PAOUTFIT",
  description:
    "Política de tratamiento de datos personales de PAOUTFIT, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.",
};

export default function DataPolicyPage() {
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
