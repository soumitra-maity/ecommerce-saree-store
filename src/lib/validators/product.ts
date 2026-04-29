// src/lib/validators/product.ts
import { z } from 'zod';
import { CATEGORIES, GENDERS } from '@/lib/constants';

export const productFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1, 'Price must be at least 1'),
  compareAtPrice: z.coerce.number().optional(),
  gender: z.enum(GENDERS as readonly [string, ...string[]]),
  category: z.enum([...CATEGORIES.women, ...CATEGORIES.men] as readonly [string, ...string[]]),
  images: z.array(z.instanceof(File)).min(1, 'At least one image is required'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or hyphens'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});