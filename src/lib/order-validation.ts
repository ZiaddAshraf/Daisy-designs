import { z } from "zod";

export const checkoutSchema = z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(8).max(30),
    email: z.string().email().optional().or(z.literal("")),
    governorate: z.string().trim().min(2).max(80),
    city: z.string().trim().min(2).max(80),
    address: z.string().trim().min(5).max(300),
    notes: z.string().max(500).optional(),
    couponCode: z.string().trim().max(40).optional(),
    requestId: z.string().uuid().optional(),
    items: z.array(z.object({ slug: z.string().min(1), quantity: z.number().int().min(1).max(50), customization: z.record(z.string(), z.string()).optional(), variantId: z.string().optional() })).min(1).max(100),
    paymentMethod: z.literal("COD"),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
