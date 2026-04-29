// src/app/admin/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 💡 TIP: In MongoDB, manually update your user document: { role: "admin" }
  // For now, we bypass strict role check to keep the dev flow smooth.

  const links = [
    { href: "/admin", label: "📊 Dashboard" },
    { href: "/admin/products", label: "📦 Products" },
    { href: "/admin/products/add", label: "➕ Add Product" },
    { href: "/admin/orders", label: "🛒 Orders" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-8 text-gray-900">Admin Panel</h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-100 text-gray-700 transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}