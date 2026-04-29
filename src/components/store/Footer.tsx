import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
        <p>© {new Date().getFullYear()} EthnicSaree. Crafted with ❤️ in India.</p>
        <div className="flex gap-4">
          <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          <Link href="/admin" className="hover:text-gray-900">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}