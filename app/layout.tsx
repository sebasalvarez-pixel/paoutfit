import type { Metadata } from "next";
import { Playfair_Display, Jost } from "next/font/google";
import { AttributionCapture } from "@/components/AttributionCapture";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${playfairDisplay.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink font-body">
        <AttributionCapture />
        {children}
      </body>
    </html>
  );
}
