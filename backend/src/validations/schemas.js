import { z } from 'zod';
export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(8).max(100) });
export const loginSchema = z.object({ email: z.string().email().transform(v => v.toLowerCase()), password: z.string().min(1) });
export const productSchema = z.object({ title: z.string().trim().min(2).max(140), description: z.string().min(10).max(5000), category: z.string().min(1), images: z.array(z.object({ url: z.string().refine(v => v.startsWith('/products/') || /^https?:\/\//i.test(v), 'Image URL must be HTTP(S) or a local /products asset'), publicId: z.string().optional(), alt: z.string().optional() })).min(1).max(5), price: z.coerce.number().positive(), compareAtPrice: z.coerce.number().nonnegative().optional(), stock: z.coerce.number().int().nonnegative(), sku: z.string().optional(), tags: z.array(z.string()).optional(), status: z.enum(['active', 'draft', 'archived']).optional() });
export const addressSchema = z.object({ fullName: z.string().min(2), phone: z.string().min(8).max(20), addressLine1: z.string().min(4), addressLine2: z.string().optional(), city: z.string().min(2), state: z.string().min(2), postalCode: z.string().min(4), country: z.string().default('India') });
export const reserveSchema = z.object({ addressId: z.string().min(1), items: z.array(z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(20) })).min(1).max(30) });
export const reviewSchema = z.object({ productId: z.string(), rating: z.coerce.number().int().min(1).max(5), title: z.string().max(100).optional(), comment: z.string().min(5).max(1200) });

export const forgotSchema = z.object({ email: z.string().email().transform(v => v.toLowerCase()) });
export const resetSchema = z.object({ email: z.string().email().transform(v => v.toLowerCase()), otp: z.string().length(6), password: z.string().min(8).max(100) });
export const sellerReplySchema = z.object({ reply: z.string().trim().min(2).max(1200) });
