import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function WelcomeDiscount({ code }: { code: string }) {
  return (
    <Html>
      <Head />
      <Preview>Tu 5% de descuento te está esperando ✨</Preview>
      <Body style={{ backgroundColor: "#F4EDE9", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            margin: "40px auto",
            maxWidth: "480px",
            textAlign: "center" as const,
          }}
        >
          <Heading style={{ color: "#2B2224" }}>PAOUTFIT</Heading>
          <Text style={{ color: "#C26B7C", letterSpacing: "2px" }}>
            MOVE. FEEL. BE YOU.
          </Text>
          <Section style={{ margin: "32px 0" }}>
            <Text style={{ color: "#2B2224", fontSize: "16px" }}>
              Gracias por unirte. Aquí está tu código de bienvenida:
            </Text>
            <Text
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#C26B7C",
                border: "1px dashed #C26B7C",
                display: "inline-block",
                padding: "12px 24px",
                margin: "16px 0",
              }}
            >
              {code}
            </Text>
            <Text style={{ color: "#2B2224", fontSize: "14px" }}>
              Úsalo en tu primera compra y obtén 5% de descuento.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeDiscount;
