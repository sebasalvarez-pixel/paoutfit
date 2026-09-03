import {
  Body,
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

export function NewOrderNotification({
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  items,
  totalCop,
}: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { title: string; color: string; quantity: number; unitPriceCop: number }[];
  totalCop: number;
}) {
  return (
    <Html>
      <Head />
      <Preview>Nueva venta confirmada: {orderNumber}</Preview>
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
          </Text>
          <Text style={{ color: "#2B2224", fontSize: "14px" }}>
            Cliente: <strong>{customerName}</strong>
            <br />
            Correo: {customerEmail}
            <br />
            Teléfono: {customerPhone}
          </Text>

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

          <Row style={{ borderTop: "1px solid #F8EDEE", paddingTop: "12px" }}>
            <Column>
              <Text style={{ fontWeight: "bold", color: "#2B2224" }}>Total</Text>
            </Column>
            <Column align="right">
              <Text style={{ fontWeight: "bold", color: "#C26B7C" }}>
                {formatCop(totalCop)}
              </Text>
            </Column>
          </Row>

          <Text style={{ color: "#2B2224", fontSize: "13px", marginTop: "24px" }}>
            Alista el pedido para despacho. Cuando tengas el panel de
            administración vas a poder marcarlo como enviado desde ahí.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NewOrderNotification;
