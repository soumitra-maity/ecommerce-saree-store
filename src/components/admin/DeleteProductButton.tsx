// src/components/admin/DeleteProductButton.tsx
"use client";

import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/server/actions.product";
import { useState } from "react";

interface DeleteProductButtonProps {
  productId: string;
}

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsDeleting(true);
    await deleteProductAction(productId);
    // Page will reload automatically due to form submission
  };

  return (
    <form action={deleteProductAction.bind(null, productId)}>
      <button 
        type="submit"
        disabled={isDeleting}
        onClick={handleDelete}
        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}