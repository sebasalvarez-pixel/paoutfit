import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Panel — PAOUTFIT",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory flex">
      <aside className="w-64 shrink-0 border-r border-ink/10 bg-white p-6 hidden md:block">
        <Link href="/admin" className="flex items-center gap-2 mb-8">
          <Image
            src="/brand/isotipo.png"
            alt="PAOUTFIT"
            width={25}
            height={28}
          />
          <span className="font-heading text-lg text-ink">Panel</span>
        </Link>
        <AdminNav />
        <Link
          href="/"
          className="block mt-10 text-xs text-ink/50 hover:text-rose"
        >
          ← Ver tienda
        </Link>
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
