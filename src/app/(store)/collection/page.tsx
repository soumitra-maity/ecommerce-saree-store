// src/app/(store)/collection/page.tsx
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { CATEGORIES, GENDERS } from "@/lib/constants";
import ProductCard from "@/components/store/ProductCard";
import { Suspense } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const serialize = (docs: any[]) => JSON.parse(JSON.stringify(docs));

async function ProductGrid({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const gender = typeof params.gender === "string" ? params.gender : "";
  const category = typeof params.category === "string" ? params.category : "";

  await connectDB();
  const query: any = { isActive: true };
  if (gender && GENDERS.includes(gender as any)) query.gender = gender;
  if (category) query.category = category;

  const products = serialize(await Product.find(query).sort({ createdAt: -1 }).lean());

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.length > 0 ? (
        // ✅ FIX: Explicitly type 'p' as 'any' to satisfy TypeScript
        products.map((p: any) => <ProductCard key={p._id} product={p} />)
      ) : (
        <div className="col-span-full text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-lg font-medium mb-2">No products found 😔</p>
          <p className="text-sm">Try adjusting your filters or check back later for new arrivals!</p>
        </div>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] rounded-xl bg-gray-200" />
      <Skeleton className="h-4 w-3/4 bg-gray-200" />
      <Skeleton className="h-4 w-1/2 bg-gray-200" />
    </div>
  );
}

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const gender = typeof params.gender === "string" ? params.gender : "";

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-6 sticky top-24">
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Gender</h3>
            <div className="space-y-2">
              <Link 
                href="/collection" 
                className={`block text-sm ${!gender ? "font-bold text-rose-600" : "hover:text-rose-600 transition"}`}
              >
                All Genders
              </Link>
              {GENDERS.map((g) => (
                <Link 
                  key={g} 
                  href={`/collection?gender=${g}`} 
                  className={`block text-sm ${gender === g ? "font-bold text-rose-600" : "hover:text-rose-600 transition"}`}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Category</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {[...CATEGORIES.women, ...CATEGORIES.men].map((cat) => (
                <Link
                  key={cat}
                  href={`/collection?${gender ? `gender=${gender}&` : ""}category=${encodeURIComponent(cat)}`}
                  className="block text-sm hover:text-rose-600 transition truncate"
                  title={cat}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          {gender ? `${gender}'s Collection` : "All Ethnic Wear"}
          {typeof params.category === "string" && (
            <span className="text-gray-500 font-normal"> → {params.category}</span>
          )}
        </h1>

        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        }>
          <ProductGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}