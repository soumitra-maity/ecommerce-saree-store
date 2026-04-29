// src/server/actions.product.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { productFormSchema } from "@/lib/validators/product";
import { revalidatePath } from "next/cache";

// ============================================================================
// CREATE PRODUCT ACTION
// ============================================================================
export async function createProductAction(prevState: unknown, formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized. Please sign in as admin." };
    }

    // Convert FormData to plain object for Zod validation
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      compareAtPrice: formData.get("compareAtPrice") || undefined,
      gender: formData.get("gender"),
      category: formData.get("category"),
      slug: formData.get("slug"),
      stock: formData.get("stock"),
      images: formData.getAll("images") as File[],
    };

    // Validate with Zod
    const validated = productFormSchema.safeParse(rawData);
    
    if (!validated.success) {
      // ✅ Safe error logging for Zod
      if (validated.error?.errors?.length > 0) {
        console.error("❌ Validation Errors:", validated.error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message
        })));
      } else {
        console.error("❌ Validation Error:", validated.error);
      }
      
      const errorMessage = validated.error.errors?.[0]?.message || "Validation failed. Please check all fields.";
      return { success: false, error: errorMessage };
    }

    const { images, ...productData } = validated.data;

    // Check if images exist
    if (!images || images.length === 0) {
      return { success: false, error: "Please upload at least one product image." };
    }

    // Upload images to Cloudinary
    console.log("📸 Uploading", images.length, "image(s) to Cloudinary...");
    const imageUrls = await Promise.all(
      images.map(async (file: File) => {
        if (file.size === 0) return null;
        try {
          return await uploadToCloudinary(file);
        } catch (uploadError) {
          console.error("❌ Image upload failed:", uploadError);
          return null;
        }
      })
    );

    // Filter successful uploads
    const validImageUrls = imageUrls.filter((url): url is string => url !== null);

    if (validImageUrls.length === 0) {
      return { success: false, error: "Image upload failed. Please check Cloudinary credentials and try again." };
    }

    // Connect to DB and create product
    await connectDB();
    await Product.create({ 
      ...productData, 
      images: validImageUrls 
    });

    // Revalidate cache for updated pages
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/collection");

    console.log("✅ Product created successfully!");
    return { success: true };

  } catch (error) {
    console.error("🔥 Create Product Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create product. Please try again." 
    };
  }
}

// ============================================================================
// DELETE PRODUCT ACTION
// ============================================================================
export async function deleteProductAction(productId: string) {
  "use server";
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDB();
    
    // Soft delete: set isActive to false (preserves order history)
    await Product.findByIdAndUpdate(productId, { isActive: false });

    // Revalidate cache
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/collection");

    console.log("✅ Product deleted (soft delete)");
    return { success: true };

  } catch (error) {
    console.error("🔥 Delete Product Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete product" 
    };
  }
}

// ============================================================================
// UPDATE PRODUCT ACTION (Optional - for future edit feature)
// ============================================================================
export async function updateProductAction(productId: string, formData: FormData) {
  "use server";
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      compareAtPrice: formData.get("compareAtPrice") || undefined,
      gender: formData.get("gender"),
      category: formData.get("category"),
      slug: formData.get("slug"),
      stock: formData.get("stock"),
      // Note: Image updates would need separate logic
    };

    const validated = productFormSchema.partial().safeParse(rawData);
    
    if (!validated.success) {
      const errorMessage = validated.error.errors?.[0]?.message || "Validation failed";
      return { success: false, error: errorMessage };
    }

    await connectDB();
    await Product.findByIdAndUpdate(productId, validated.data, { new: true, runValidators: true });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/collection");

    console.log("✅ Product updated successfully!");
    return { success: true };

  } catch (error) {
    console.error("🔥 Update Product Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update product" 
    };
  }
}