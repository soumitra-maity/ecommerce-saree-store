import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductCard from "@/components/store/ProductCard";

const serialize = (docs: any[]) => JSON.parse(JSON.stringify(docs));

async function getNewArrivals() {
  await connectDB();
  return serialize(await Product.find({ isActive: true, isNewArrival: true }).sort({ createdAt: -1 }).limit(4).lean());
}

async function getFeatured() {
  await connectDB();
  return serialize(await Product.find({ isActive: true, isFeatured: true }).limit(8).lean());
}

export default async function HomePage() {
  const [newArrivals, featured] = await Promise.all([getNewArrivals(), getFeatured()]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-amber-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            Timeless Elegance,<br />Woven with Tradition
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover handcrafted Banarasi, Silk, and Designer Sarees curated for the modern Indian wardrobe.
          </p>
          <a href="/collection" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition shadow-lg">
            Explore Collection
          </a>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">✨ New Arrivals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Featured / Best Sellers */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
          <h2 className="text-2xl font-bold mb-6">🔥 Best Sellers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </main>
  );
}