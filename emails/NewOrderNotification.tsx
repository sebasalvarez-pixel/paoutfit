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

function formatCop(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Aviso para la tienda: llega cuando un pedido queda PAGADO. Trae todo lo
 * necesario para alistarlo y despacharlo sin abrir el panel: qué compró,
 * cuánto, a dónde enviarlo y cómo contactar a la clienta.
 */
export function NewOrderNotification({
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  items,
  subtotalCop,
  discountCop = 0,
  shippingCop = 0,
  totalCop,
  addressLines = [],
  paymentMethod,
  isInternational = false,
  adminUrl,
}: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { title: string; color: string; quantity: number; unitPriceCop: number }[];
  subtotalCop?: number;
  discountCop?: number;
  shippingCop?: number;
  totalCop: number;
  addressLines?: string[];
  paymentMethod?: string;
  isInternational?: boolean;
  adminUrl?: string;
}) {
  const sub =
    subtotalCop ?? items.reduce((sum, i) => sum + i.unitPriceCop * i.quantity, 0);
  const whatsapp = customerPhone.replace(/\D/g, "");

  const AmountRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <Row>
      <Column>
        <Text style={{ margin: "4px 0", fontSize: "14px", color: "#2B2224", fontWeight: bold ? "bold" : "normal" }}>
          {label}
        </Text>
      </Column>
      <Column align="right">
        <Text style={{ margin: "4px 0", fontSize: "14px", color: "#C26B7C", fontWeight: bold ? "bold" : "normal" }}>
          {value}
        </Text>
      </Column>
    </Row>
  );

  return (
    <Html>
      <Head />
      <Preview>
        Nueva venta pagada {orderNumber} — {formatCop(totalCop)}
      </Preview>
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
            💰 Nueva venta pagada
          </Heading>
          <Text style={{ color: "#2B2224", fontSize: "14px" }}>
            Pedido: <strong>{orderNumber}</strong>
            {paymentMethod ? ` · Pagó con ${paymentMethod}` : ""}
            {isInternational ? " · 🌎 Envío internacional" : ""}
          </Text>

          <Text style={{ color: "#2B2224", fontSize: "14px" }}>
            <strong>Cliente:</strong> {customerName}
            <br />
            Correo: {customerEmail}
            <br />
            Teléfono / WhatsApp:{" "}
            <a href={`https://wa.me/${whatsapp}`} style={{ color: "#C26B7C" }}>
              {customerPhone}
            </a>
          </Text>

          {addressLines.length > 0 && (
            <Text style={{ color: "#2B2224", fontSize: "14px" }}>
              <strong>Enviar a:</strong>
              <br />
              {addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </Text>
          )}

          <Section style={{ margin: "20px 0 12px" }}>
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
            <AmountRow label="Subtotal" value={formatCop(sub)} />
            {discountCop > 0 && (
              <AmountRow label="Descuento" value={`-${formatCop(discountCop)}`} />
            )}
            <AmountRow
              label="Envío"
              value={shippingCop === 0 ? "Gratis" : formatCop(shippingCop)}
            />
            <AmountRow label="Total pagado" value={formatCop(totalCop)} bold />
          </Section>

          <Text style={{ color: "#2B2224", fontSize: "13px", marginTop: "20px" }}>
            Alista el pedido para despacho. Cuando lo envíes, regístralo en el
            panel con el número de guía: la clienta recibe un correo con su
            guía automáticamente.
          </Text>

          {adminUrl && (
            <Section style={{ textAlign: "center" as const, margin: "16px 0 0" }}>
              <Button
                href={adminUrl}
                style={{
                  backgroundColor: "#C26B7C",
                  color: "#ffffff",
                  padding: "12px 28px",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Abrir el pedido en el panel
              </Button>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  );
}

export default NewOrderNotification;
