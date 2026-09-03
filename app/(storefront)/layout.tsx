import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { EmailCapturePopup } from "@/components/storefront/EmailCapturePopup";
import { getHeroImage } from "@/lib/products";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const heroImage = await getHeroImage();

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <EmailCapturePopup image={heroImage} />
    </>
  );
}
