// src/app/(store)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { createOrderAction, verifyPaymentAction } from "@/server/actions.order";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Script from "next/script";

// Global TS declaration for Razorpay Checkout
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCartStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  if (items.length === 0 && typeof window !== "undefined") {
    router.push("/cart");
    return null;
  }

  const [state, formAction] = useActionState(createOrderAction, { success: false, error: "" });

  // Open Razorpay when server action succeeds
  useEffect(() => {
    if (state.success && state.orderId && !isProcessing) {
      openRazorpay(state.orderId, state.amount!);
    }
  }, [state.success]);

  const openRazorpay = async (orderId: string, amount: number) => {
    if (typeof window === "undefined") return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      name: "EthnicSaree",
      description: `Order Payment (${items.length} items)`,
      order_id: orderId,
      handler: async (response: any) => {
        setIsProcessing(true);
        const verify = await verifyPaymentAction(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
        
        if (verify.success) {
          clearCart();
          router.push("/orders"); // Redirect to order success page
        } else {
          alert(`Payment failed: ${verify.error}`);
        }
        setIsProcessing(false);
      },
      prefill: {
        name: state.success ? "Guest User" : "",
        email: "",
        contact: "",
      },
      theme: { color: "#e11d48" }, // Rose-600 matching your theme
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => alert("Payment cancelled or failed."));
    rzp.open();
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Load Razorpay SDK securely */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900">Secure Checkout</h1>

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          ❌ {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
        {/* Shipping Address */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" required placeholder="e.g., Anjali Verma" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input id="phone" name="phone" required placeholder="10-digit number" pattern="[6-9]\d{9}" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" name="pincode" required placeholder="6-digit" pattern="\d{6}" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street">Flat/Street/Landmark</Label>
              <Input id="street" name="street" required placeholder="Complete delivery address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" required />
            </div>
          </div>
        </div>

        {/* Hidden Cart Payload */}
        <input type="hidden" name="cartItems" value={JSON.stringify(items)} />

        {/* Order Summary & Pay Button */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">Total Payable</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString("en-IN")}</p>
          </div>
          <Button
            type="submit"
            disabled={isProcessing || items.length === 0}
            size="lg"
            className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isProcessing ? "Processing Payment..." : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
          </Button>
        </div>
      </form>
    </main>
  );
}