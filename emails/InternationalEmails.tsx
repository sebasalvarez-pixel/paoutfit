import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

type Locale = "es" | "en";

type EmailItem = {
  title: string;
  color: string;
  quantity: number;
  unitPriceCop: number;
};

function formatCop(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function Shell({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#F4EDE9", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            margin: "40px auto",
            maxWidth: "520px",
          }}
        >
          {children}
        </Container>
      </Body>
    </Html>
  );
}

function ItemsList({ items }: { items: EmailItem[] }) {
  return (
    <Section style={{ margin: "24px 0" }}>
      {items.map((item, i) => (
        <Row key={i} style={{ marginBottom: "8px" }}>
          <Column>
            <Text style={{ margin: 0, fontSize: "14px", color: "#2B2224" }}>
              {item.title} ({item.color}) × {item.quantity}
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ margin: 0, fontSize: "14px", color: "#C26B7C" }}>
              {formatCop(item.unitPriceCop * item.quantity)}
            </Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

function AmountRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Row>
      <Column>
        <Text style={{ margin: "4px 0", color: "#2B2224", fontWeight: bold ? "bold" : "normal" }}>
          {label}
        </Text>
      </Column>
      <Column align="right">
        <Text style={{ margin: "4px 0", color: "#C26B7C", fontWeight: bold ? "bold" : "normal" }}>
          {value}
        </Text>
      </Column>
    </Row>
  );
}

const headingStyle = { color: "#2B2224", textAlign: "center" as const };
const bodyText = { color: "#2B2224", fontSize: "14px" };

/** Para la clienta internacional: recibimos tu pedido, falta cotizar el envío. */
export function InternationalOrderReceived({
  orderNumber,
  customerName,
  items,
  subtotalCop,
  locale,
}: {
  orderNumber: string;
  customerName: string;
  items: EmailItem[];
  subtotalCop: number;
  locale: Locale;
}) {
  const en = locale === "en";
  return (
    <Shell preview={en ? `We received your order ${orderNumber}` : `Recibimos tu pedido ${orderNumber}`}>
      <Heading style={headingStyle}>
        {en ? "We received your order!" : "¡Recibimos tu pedido!"}
      </Heading>
      <Text style={bodyText}>
        {en ? `Hi ${customerName},` : `Hola ${customerName},`}
      </Text>
      <Text style={bodyText}>
        {en
          ? `Your order ${orderNumber} is in. We're quoting the international shipping with DHL and we'll email you the total cost with a payment link shortly. You don't pay anything until you confirm it.`
          : `Tu pedido ${orderNumber} está registrado. Estamos cotizando el envío internacional con DHL y muy pronto te escribiremos con el costo total y un link de pago. No pagas nada hasta que lo confirmes.`}
      </Text>
      <ItemsList items={items} />
      <AmountRow label={en ? "Products subtotal" : "Subtotal de productos"} value={formatCop(subtotalCop)} />
      <AmountRow label={en ? "International shipping" : "Envío internacional"} value={en ? "To be quoted" : "Por cotizar"} />
    </Shell>
  );
}

/** Para la dueña: hay un pedido internacional que necesita cotización de envío. */
export function InternationalQuoteRequest({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  addressText,
  items,
  subtotalCop,
  adminUrl,
}: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressText: string;
  items: EmailItem[];
  subtotalCop: number;
  adminUrl: string;
}) {
  return (
    <Shell preview={`Pedido internacional por cotizar: ${orderNumber}`}>
      <Heading style={headingStyle}>🌎 Pedido internacional por cotizar</Heading>
      <Text style={bodyText}>
        Pedido: <strong>{orderNumber}</strong>
      </Text>
      <Text style={bodyText}>
        Cliente: <strong>{customerName}</strong>
        <br />
        Correo: {customerEmail}
        <br />
        Teléfono: {customerPhone}
        <br />
        Destino: {addressText}
      </Text>
      <ItemsList items={items} />
      <AmountRow label="Subtotal de productos" value={formatCop(subtotalCop)} bold />
      <Text style={{ ...bodyText, marginTop: "24px" }}>
        Cotiza el envío con DHL y regístralo en el panel: al guardar, el cliente
        recibe el link de pago por correo automáticamente.
      </Text>
      <Section style={{ textAlign: "center" as const }}>
        <Button
          href={adminUrl}
          style={{ backgroundColor: "#C26B7C", color: "#ffffff", padding: "12px 24px", fontSize: "14px" }}
        >
          Abrir pedido en el panel
        </Button>
      </Section>
    </Shell>
  );
}

/** Para la clienta internacional: ya está cotizado el envío, aquí está el link de pago. */
export function ShippingQuoteReady({
  orderNumber,
  customerName,
  items,
  subtotalCop,
  discountCop,
  shippingCop,
  totalCop,
  payUrl,
  locale,
}: {
  orderNumber: string;
  customerName: string;
  items: EmailItem[];
  subtotalCop: number;
  discountCop: number;
  shippingCop: number;
  totalCop: number;
  payUrl: string;
  locale: Locale;
}) {
  const en = locale === "en";
  return (
    <Shell
      preview={
        en
          ? `Your shipping quote for order ${orderNumber} is ready`
          : `Tu cotización de envío del pedido ${orderNumber} está lista`
      }
    >
      <Heading style={headingStyle}>
        {en ? "Your shipping quote is ready" : "Tu cotización de envío está lista"}
      </Heading>
      <Text style={bodyText}>
        {en ? `Hi ${customerName},` : `Hola ${customerName},`}
      </Text>
      <Text style={bodyText}>
        {en
          ? `Here's the total for order ${orderNumber}, including international shipping with DHL. Prices are in Colombian pesos (COP); your bank will convert the amount to your own currency.`
          : `Este es el total del pedido ${orderNumber}, incluyendo el envío internacional con DHL.`}
      </Text>
      <ItemsList items={items} />
      <AmountRow label={en ? "Products subtotal" : "Subtotal de productos"} value={formatCop(subtotalCop)} />
      {discountCop > 0 && (
        <AmountRow label={en ? "Discount" : "Descuento"} value={`-${formatCop(discountCop)}`} />
      )}
      <AmountRow label={en ? "International shipping (DHL)" : "Envío internacional (DHL)"} value={formatCop(shippingCop)} />
      <AmountRow label="Total" value={formatCop(totalCop)} bold />
      <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
        <Button
          href={payUrl}
          style={{ backgroundColor: "#C26B7C", color: "#ffffff", padding: "12px 24px", fontSize: "14px" }}
        >
          {en ? "Pay now" : "Pagar ahora"}
        </Button>
      </Section>
      <Text style={{ ...bodyText, fontSize: "12px", marginTop: "24px" }}>
        {en
          ? "If you have any questions, just reply to this email or message us on WhatsApp."
          : "Si tienes dudas, responde a este correo o escríbenos por WhatsApp."}
      </Text>
    </Shell>
  );
}
