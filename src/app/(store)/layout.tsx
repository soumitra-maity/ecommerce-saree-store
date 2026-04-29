// src/app/(store)/layout.tsx
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import CartSync from "@/components/store/CartSync";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* ✅ Background cart sync (invisible to user) */}
      <CartSync />
    </div>
  );
}