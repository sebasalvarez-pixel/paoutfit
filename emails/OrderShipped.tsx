import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type Locale = "es" | "en";

const TEXT = {
  es: {
    preview: (n: string) => `Tu pedido ${n} va en camino`,
    hello: (name: string) => `¡Hola ${name}! Tu pedido va en camino 🚚`,
    orderNumber: "Número de pedido",
    carrier: "Transportadora",
    tracking: "Número de guía",
    noTracking: "Te avisaremos el número de guía en cuanto lo tengamos.",
    track: "Ver estado de mi pedido",
    note: "Los tiempos de entrega dependen de la transportadora y de tu ciudad. Si tienes cualquier duda, escríbenos por WhatsApp:",
    thanks: "¡Gracias por comprar en PAOUTFIT!",
  },
  en: {
    preview: (n: string) => `Your order ${n} is on its way`,
    hello: (name: string) => `Hi ${name}! Your order is on its way 🚚`,
    orderNumber: "Order number",
    carrier: "Carrier",
    tracking: "Tracking number",
    noTracking: "We'll send you the tracking number as soon as we have it.",
    track: "Check my order status",
    note: "Delivery times depend on the carrier and your location. If you have any questions, message us on WhatsApp:",
    thanks: "Thank you for shopping at PAOUTFIT!",
  },
};

export function OrderShipped({
  orderNumber,
  customerName,
  carrier,
  trackingNumber,
  trackUrl,
  locale = "es",
}: {
  orderNumber: string;
  customerName: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackUrl?: string;
  locale?: Locale;
}) {
  const t = TEXT[locale];
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
            {carrier ? (
              <>
                <br />
                {t.carrier}: <strong>{carrier}</strong>
              </>
            ) : null}
            <br />
            {trackingNumber ? (
              <>
                {t.tracking}: <strong>{trackingNumber}</strong>
              </>
            ) : (
              t.noTracking
            )}
          </Text>

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
            {t.note}{" "}
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

export default OrderShipped;
