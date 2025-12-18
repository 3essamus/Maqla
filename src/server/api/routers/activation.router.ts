import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "src/server/api/trpc";
import { getUserUsageStats } from "src/server/utils/tierLimits";
import { activationKeyInput } from "src/utils/validators";

export const activationRouter = createTRPCRouter({
    /** Activate a key and upgrade user tier */
    activateKey: protectedProcedure.input(activationKeyInput).mutation(async ({ ctx, input }) => {
        // Find the activation key
        const key = await ctx.prisma.activationKey.findUnique({
            where: { key: input.key },
        });

        if (!key) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invalid activation key",
            });
        }

        // Check if key is already used
        if (key.status === "USED") {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "This activation key has already been used",
            });
        }

        // Check if key is expired
        if (key.status === "EXPIRED" || new Date() > key.expiresAt) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "This activation key has expired",
            });
        }

        // Calculate tier expiration (1 year from now for PAID tier)
        const tierExpiresAt = new Date();
        tierExpiresAt.setFullYear(tierExpiresAt.getFullYear() + 1);

        // Update user tier and mark key as used
        const [updatedUser] = await ctx.prisma.$transaction([
            ctx.prisma.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    tier: key.tier,
                    tierExpiresAt: key.tier === "PAID" ? tierExpiresAt : null,
                },
            }),
            ctx.prisma.activationKey.update({
                where: { key: input.key },
                data: {
                    status: "USED",
                    userId: ctx.session.user.id,
                    activatedAt: new Date(),
                },
            }),
        ]);

        return {
            success: true,
            tier: updatedUser.tier,
            tierExpiresAt: updatedUser.tierExpiresAt,
        };
    }),

    /** Get current user's tier status and usage */
    getMyTierStatus: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.session.user.id },
            select: {
                tier: true,
                tierExpiresAt: true,
            },
        });

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }

        const usage = await getUserUsageStats(ctx.prisma, ctx.session.user.id, user.tier);

        return {
            tier: user.tier,
            tierExpiresAt: user.tierExpiresAt,
            usage,
        };
    }),
});
