import { TRPCError } from "@trpc/server";
import { type PrismaClient, type UserTier } from "@prisma/client";

/**
 * Tier limits configuration
 */
export const TIER_LIMITS = {
    FREE: {
        maxRestaurants: 1,
        maxMenus: 3,
        maxMenuItems: 5, // Total across all menus
    },
    PAID: {
        maxRestaurants: 1,
        maxMenus: Infinity,
        maxMenuItems: Infinity,
    },
} as const;

/**
 * Check if user can create a restaurant
 */
export async function checkRestaurantLimit(prisma: PrismaClient, userId: string, tier: UserTier) {
    const limit = TIER_LIMITS[tier].maxRestaurants;

    const count = await prisma.restaurant.count({
        where: { userId },
    });

    if (count >= limit) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: `${tier} tier limit: ${limit} restaurant maximum. ${tier === "FREE" ? "Upgrade to PAID tier for more features." : ""}`,
        });
    }

    return true;
}

/**
 * Check if user can create a menu
 */
export async function checkMenuLimit(prisma: PrismaClient, userId: string, tier: UserTier) {
    const limit = TIER_LIMITS[tier].maxMenus;

    if (limit === Infinity) return true;

    const count = await prisma.menu.count({
        where: { userId },
    });

    if (count >= limit) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: `${tier} tier limit: ${limit} menus maximum. Upgrade to PAID tier for unlimited menus.`,
        });
    }

    return true;
}

/**
 * Check if user can create a menu item
 */
export async function checkMenuItemLimit(prisma: PrismaClient, userId: string, tier: UserTier) {
    const limit = TIER_LIMITS[tier].maxMenuItems;

    if (limit === Infinity) return true;

    // Count total menu items across all restaurants
    const count = await prisma.menuItem.count({
        where: { userId },
    });

    if (count >= limit) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: `${tier} tier limit: ${limit} menu items maximum (total across all menus). Upgrade to PAID tier for unlimited items.`,
        });
    }

    return true;
}

/**
 * Get usage stats for a user
 */
export async function getUserUsageStats(prisma: PrismaClient, userId: string, tier: UserTier) {
    const [restaurantCount, menuCount, menuItemCount] = await Promise.all([
        prisma.restaurant.count({ where: { userId } }),
        prisma.menu.count({ where: { userId } }),
        prisma.menuItem.count({ where: { userId } }),
    ]);

    const limits = TIER_LIMITS[tier];

    return {
        restaurants: {
            used: restaurantCount,
            limit: limits.maxRestaurants,
            percentage: limits.maxRestaurants === Infinity ? 0 : (restaurantCount / limits.maxRestaurants) * 100,
        },
        menus: {
            used: menuCount,
            limit: limits.maxMenus === Infinity ? null : limits.maxMenus,
            percentage: limits.maxMenus === Infinity ? 0 : (menuCount / limits.maxMenus) * 100,
        },
        menuItems: {
            used: menuItemCount,
            limit: limits.maxMenuItems === Infinity ? null : limits.maxMenuItems,
            percentage: limits.maxMenuItems === Infinity ? 0 : (menuItemCount / limits.maxMenuItems) * 100,
        },
        tier,
    };
}

/**
 * Check if tier has expired
 */
export function isTierExpired(tierExpiresAt: Date | null): boolean {
    if (!tierExpiresAt) return false;
    return new Date() > tierExpiresAt;
}
