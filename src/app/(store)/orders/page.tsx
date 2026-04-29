// src/app/(store)/orders/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

const serialize = (docs: any[]) => JSON.parse(JSON.stringify(docs));

// Status icon mapping
const statusIcons: Record<string, JSX.Element> = {
  pending: <Clock className="w-5 h-5 text-amber-500" />,
  processing: <Package className="w-5 h-5 text-blue-500" />,
  shipped: <Truck className="w-5 h-5 text-indigo-500" />,
  delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
  cancelled: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const statusLabels: Record<string, string> = {
  pending: "Order Received",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await connectDB();
  const orders = serialize(
    await Order.find({ clerkId: userId }).sort({ createdAt: -1 }).lean()
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">My Orders</h1>
        <Link 
          href="/collection" 
          className="text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          ← Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <Link 
            href="/collection" 
            className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div 
              key={order._id} 
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    {order.razorpayOrderId || order._id.toString().slice(-12)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {statusIcons[order.status] || statusIcons.pending}
                  <span className={`text-sm font-medium ${
                    order.status === "delivered" ? "text-green-600" :
                    order.status === "cancelled" ? "text-red-600" :
                    "text-gray-700"
                  }`}>
                    {statusLabels[order.status] || "Processing"}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <p className="text-sm text-gray-500 mb-2">Items ({order.items.length})</p>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden relative shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-gray-500">Qty: {item.quantity} • ₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500 pl-13">+{order.items.length - 3} more items</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-lg font-bold text-gray-900">₹{order.totalAmount.toLocaleString("en-IN")}</p>
                </div>
                
                <div className="flex gap-2">
                  {order.status !== "delivered" && order.status !== "cancelled" && (
                    <button className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                      Track Order
                    </button>
                  )}
                  {order.status === "delivered" && (
                    <Link 
                      href={`/product/${order.items[0]?.productId}`} 
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Reorder
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}