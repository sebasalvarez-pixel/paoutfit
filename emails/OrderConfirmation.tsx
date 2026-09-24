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

function formatCop(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

const TEXT = {
  es: {
    preview: (n: string) => `Tu pedido ${n} fue confirmado`,
    hello: (name: string) => `¡Hola ${name}! Tu pedido fue confirmado 🎉`,
    orderNumber: "Número de pedido",
    subtotal: "Subtotal",
    discount: "Descuento",
    shipping: "Envío",
    free: "Gratis",
    total: "Total",
    shipTo: "Lo enviaremos a",
    track: "Rastrear mi pedido",
    next: "Te escribiremos de nuevo cuando tu pedido sea despachado, con tu número de guía. Puedes consultar su estado cuando quieras con tu número de pedido y este correo.",
    help: "¿Dudas? Escríbenos por WhatsApp:",
    thanks: "Gracias por elegirnos.",
  },
  en: {
    preview: (n: string) => `Your order ${n} is confirmed`,
    hello: (name: string) => `Hi ${name}! Your order is confirmed 🎉`,
    orderNumber: "Order number",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping",
    free: "Free",
    total: "Total",
    shipTo: "We'll ship it to",
    track: "Track my order",
    next: "We'll email you again when your order ships, with your tracking number. You can check its status anytime with your order number and this email.",
    help: "Questions? Message us on WhatsApp:",
    thanks: "Thank you for choosing us.",
  },
};

export function OrderConfirmation({
  orderNumber,
  customerName,
  items,
  subtotalCop,
  discountCop = 0,
  shippingCop = 0,
  totalCop,
  addressLines = [],
  trackUrl,
  locale = "es",
}: {
  orderNumber: string;
  customerName: string;
  items: { title: string; color: string; quantity: number; unitPriceCop: number }[];
  subtotalCop?: number;
  discountCop?: number;
  shippingCop?: number;
  totalCop: number;
  addressLines?: string[];
  trackUrl?: string;
  locale?: Locale;
}) {
  const t = TEXT[locale];
  const sub =
    subtotalCop ?? items.reduce((sum, i) => sum + i.unitPriceCop * i.quantity, 0);

  const AmountRow = ({
    label,
    value,
    bold,
  }: {
    label: string;
    value: string;
    bold?: boolean;
  }) => (
    <Row>
      <Column>
        <Text
          style={{ margin: "4px 0", fontSize: "14px", color: "#2B2224", fontWeight: bold ? "bold" : "normal" }}
        >
          {label}
        </Text>
      </Column>
      <Column align="right">
        <Text
          style={{ margin: "4px 0", fontSize: "14px", color: "#C26B7C", fontWeight: bold ? "bold" : "normal" }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );

  return (
    <Html>
      <Head />
      <Preview>{t.preview(orderNumber)}</Preview>
      <Body style={{ backgroundColor: "#F4EDE9", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            margin: "40px auto",
            maxWidth: "520px",
          }}
        >
          <Heading style={{ color: "#2B2224", textAlign: "center" as const }}>
            PAOUTFIT
          </Heading>
          <Text style={{ color: "#2B2224", fontSize: "16px" }}>{t.hello(customerName)}</Text>
          <Text style={{ color: "#2B2224", fontSize: "14px" }}>
            {t.orderNumber}: <strong>{orderNumber}</strong>
          </Text>

          <Section style={{ margin: "24px 0 12px" }}>
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

          <Section style={{ borderTop: "1px solid #F8EDEE", paddingTop: "8px" }}>
            <AmountRow label={t.subtotal} value={formatCop(sub)} />
            {discountCop > 0 && (
              <AmountRow label={t.discount} value={`-${formatCop(discountCop)}`} />
            )}
            <AmountRow
              label={t.shipping}
              value={shippingCop === 0 ? t.free : formatCop(shippingCop)}
            />
            <AmountRow label={t.total} value={formatCop(totalCop)} bold />
          </Section>

          {addressLines.length > 0 && (
            <Text style={{ color: "#2B2224", fontSize: "14px", marginTop: "20px" }}>
              <strong>{t.shipTo}:</strong>
              <br />
              {addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </Text>
          )}

          <Text style={{ color: "#2B2224", fontSize: "13px", marginTop: "20px" }}>{t.next}</Text>

          {trackUrl && (
            <Section style={{ textAlign: "center" as const, margin: "20px 0" }}>
              <Button
                href={trackUrl}
                style={{
                  backgroundColor: "#C26B7C",
                  color: "#ffffff",
                  padding: "12px 28px",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                {t.track}
              </Button>
            </Section>
          )}

          <Text style={{ color: "#2B2224", fontSize: "12px" }}>
            {t.help}{" "}
            <a href="https://wa.me/573114857551" style={{ color: "#C26B7C" }}>
              +57 311 485 7551
            </a>
            <br />
            {t.thanks}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmation;
