import { z } from "zod";

export const menuId = z.object({ menuId: z.string().cuid() });
export const categoryId = z.object({ categoryId: z.string().cuid() });
export const restaurantId = z.object({ restaurantId: z.string().cuid() });
export const id = z.object({ id: z.string().cuid() });

export const categoryInput = z.object({
    name: z.string().trim().min(1, "Name is required").max(30, "Name cannot be longer than 30 characters"),
});
export const menuInput = z.object({
    availableTime: z.string().trim().max(20, "Available time cannot be longer than 20 characters"),
    name: z.string().trim().min(1, "Name is required").max(30, "Name cannot be longer than 30 characters"),
});
export const menuItemInput = z.object({
    description: z.string().trim().max(185, "Description cannot be longer than 185 characters"),
    imageBase64: z.string().optional(),
    imagePath: z.string().optional(),
    name: z.string().trim().min(1, "Name is required").max(50, "Name cannot be longer than 50 characters"),
    price: z.string().trim().min(1, "Price is required").max(12, "Price cannot be longer than 12 characters"),
});
export const restaurantInput = z.object({
    contactNo: z.union([
        z
            .string()
            .trim()
            .regex(/^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/, "Invalid contact number"),
        z.literal(""),
    ]),
    whatsappNumber: z.union([
        z
            .string()
            .trim()
            .regex(/^(\+213|0)(5|6|7)[0-9]{8}$/, "Invalid Algerian phone number"),
        z.literal(""),
    ]).optional(),
    deliveryFee: z.union([
        z.number().int().min(0).max(9999),
        z.null(),
    ]).optional(),
    imageBase64: z.string(),
    imagePath: z.string().min(1, "Image is required"),
    location: z.string().trim().min(1, "Location is required").max(75, "Location cannot be longer than 75 characters"),
    name: z.string().trim().min(1, "Name is required").max(40, "Name cannot be longer than 40 characters"),
});
export const bannerInput = z.object({
    imageBase64: z.string().min(1, "Image is required"),
    restaurantId: z.string().cuid(),
});

export const reviewInput = z.object({
    restaurantId: z.string().cuid(),
    buyerName: z.string().trim().min(1, "Name is required").max(50, "Name cannot be longer than 50 characters"),
    rating: z.number().int().min(1, "Rating must be at least 1 star").max(5, "Rating cannot exceed 5 stars"),
    comment: z.string().trim().min(1, "Comment is required").max(500, "Comment cannot be longer than 500 characters"),
    fingerprint: z.string(),
});

export const activationKeyInput = z.object({
    key: z.string().trim().min(1, "Activation key is required"),
});

export const generateKeyInput = z.object({
    tier: z.enum(["FREE", "PAID"]),
    expiresInDays: z.number().int().min(1).max(3650).default(365), // Default 1 year
});
