import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import { AttributionCapture } from "@/components/AttributionCapture";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getLocale } from "@/lib/i18n/get-locale";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAOUTFIT — Move. Feel. Be You.",
  description:
    "Ropa deportiva y athleisure para mujer. Diseños femeninos, cómodos y versátiles para entrenar, salir o simplemente ser tú.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${playfairDisplay.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink font-body">
        <LocaleProvider initialLocale={locale}>
          <AttributionCapture />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
