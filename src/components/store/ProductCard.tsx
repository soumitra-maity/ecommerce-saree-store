import Link from "next/link";
import Image from "next/image";
import type { ProductDocument } from "@/models/Product";

// Mongoose returns ObjectId. We serialize it to string in server components.
type SerializedProduct = Omit<ProductDocument, "_id"> & { _id: string };

export default function ProductCard({ product }: { product: SerializedProduct }) {
  return (
    <Link href={`/product/${product._id}`} className="group block">
      <div className="aspect-[3/4] relative bg-gray-100 rounded-xl overflow-hidden mb-3">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-base font-bold">₹{product.price.toLocaleString("en-IN")}</span>
        {product.compareAtPrice && (
          <span className="text-xs text-gray-500 line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</span>
        )}
      </div>
    </Link>
  );
}