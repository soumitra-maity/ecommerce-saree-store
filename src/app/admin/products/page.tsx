// src/app/admin/products/page.tsx
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

const serialize = (docs: any[]) => JSON.parse(JSON.stringify(docs));

export default async function AdminProductsPage() {
  await connectDB();
  const products = serialize(await Product.find().sort({ createdAt: -1 }).lean());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
        <Link 
          href="/admin/products/add" 
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No products yet. Create your first product!</p>
          <Link 
            href="/admin/products/add" 
            className="inline-flex items-center gap-2 text-rose-600 font-medium hover:text-rose-700"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product: any) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                          <Image 
                            src={product.images[0]} 
                            alt={product.title} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{product.title}</div>
                          <div className="text-sm text-gray-500">{product.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{product.price.toLocaleString("en-IN")}
                      {product.compareAtPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₹{product.compareAtPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                        {product.stock} {product.stock > 0 ? "in stock" : "out of stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <Link 
                          href={`/product/${product._id}`} 
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        
                        {/* Edit Button (placeholder for now) */}
                        <Link 
                          href={`/admin/products/edit/${product._id}`} 
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit (coming soon)"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        
                        {/* Delete Button (Client Component) */}
                        <DeleteProductButton productId={product._id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}