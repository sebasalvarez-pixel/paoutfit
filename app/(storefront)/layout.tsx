import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { EmailCapturePopup } from "@/components/storefront/EmailCapturePopup";
import { getHeroImage } from "@/lib/products";
import { getStoreCategories } from "@/lib/categories";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [heroImage, categories] = await Promise.all([
    getHeroImage(),
    getStoreCategories(),
  ]);

  return (
    <>
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
      <EmailCapturePopup image={heroImage} />
    </>
  );
}
