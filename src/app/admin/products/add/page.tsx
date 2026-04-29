// src/app/admin/products/add/page.tsx
"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/server/actions.product";
import { CATEGORIES, GENDERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddProductPage() {
  const router = useRouter();
  
  // React 19 hook for Server Action state management
  const [state, formAction, isPending] = useActionState(createProductAction, { success: false, error: "" });

  if (state.success) {
    router.push("/admin/products");
    return null;
  }

  return (
    <form action={formAction} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      {state.error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          ❌ {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Product Title</Label>
          <Input id="title" name="title" placeholder="e.g., Handwoven Banarasi Silk Saree" required />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug (lowercase, hyphens)</Label>
          <Input id="slug" name="slug" placeholder="handwoven-banarasi-silk" required pattern="^[a-z0-9-]+$" />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select name="gender" required defaultValue="Women">
            <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Category (Strictly mapped) */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" required defaultValue="Banarasi Saree">
            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
            <SelectContent>
              {/* Combine Women & Men categories exactly as specified */}
              {[...CATEGORIES.women, ...CATEGORIES.men].map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price & Compare Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" name="price" type="number" min="1" step="0.01" placeholder="2500" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compareAtPrice">Original/Compare Price (₹) <span className="text-gray-400">(Optional)</span></Label>
          <Input id="compareAtPrice" name="compareAtPrice" type="number" min="0" step="0.01" placeholder="3500" />
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue="10" required />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label htmlFor="images">Product Images</Label>
          <Input id="images" name="images" type="file" multiple accept="image/*" required className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:hover:bg-gray-200" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Fabric, care instructions, design details..." rows={4} required />
      </div>

      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? "Uploading & Saving..." : "Create Product"}
      </Button>
    </form>
  );
}