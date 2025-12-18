import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "src/server/api/trpc";
import { generateKeyInput, id } from "src/utils/validators";

export const adminRouter = createTRPCRouter({
    /** Generate a new activation key */
    generateKey: adminProcedure.input(generateKeyInput).mutation(async ({ ctx, input }) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

        return ctx.prisma.activationKey.create({
            data: {
                tier: input.tier,
                expiresAt,
                createdBy: ctx.session.user.id,
            },
            select: {
                id: true,
                key: true,
                tier: true,
                expiresAt: true,
                status: true,
                createdAt: true,
            },
        });
    }),

    /** Get all activation keys with optional filters */
    getKeys: adminProcedure
        .input(
            z
                .object({
                    status: z.enum(["UNUSED", "USED", "EXPIRED"]).optional(),
                    tier: z.enum(["FREE", "PAID"]).optional(),
                    limit: z.number().min(1).max(100).default(50),
                    offset: z.number().min(0).default(0),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const where: any = {};

            if (input?.status) {
                where.status = input.status;
            }

            if (input?.tier) {
                where.tier = input.tier;
            }

            const [keys, total] = await ctx.prisma.$transaction([
                ctx.prisma.activationKey.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: input?.limit ?? 50,
                    skip: input?.offset ?? 0,
                }),
                ctx.prisma.activationKey.count({ where }),
            ]);

            return { keys, total };
        }),

    /** Get all users with their tier information */
    getUsers: adminProcedure
        .input(
            z
                .object({
                    limit: z.number().min(1).max(100).default(50),
                    offset: z.number().min(0).default(0),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const [users, total] = await ctx.prisma.$transaction([
                ctx.prisma.user.findMany({
                    include: {
                        restaurants: {
                            select: {
                                id: true,
                                name: true,
                                isPublished: true,
                            },
                        },
                        _count: {
                            select: {
                                restaurants: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: input?.limit ?? 50,
                    skip: input?.offset ?? 0,
                }),
                ctx.prisma.user.count(),
            ]);

            return { users, total };
        }),

    /** Get all restaurants for moderation */
    getAllRestaurants: adminProcedure
        .input(
            z
                .object({
                    isPublished: z.boolean().optional(),
                    limit: z.number().min(1).max(100).default(50),
                    offset: z.number().min(0).default(0),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const where: any = {};

            if (input?.isPublished !== undefined) {
                where.isPublished = input.isPublished;
            }

            const [restaurants, total] = await ctx.prisma.$transaction([
                ctx.prisma.restaurant.findMany({
                    where,
                    include: {
                        image: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                tier: true,
                            },
                        },
                        _count: {
                            select: {
                                menus: true,
                                reviews: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: input?.limit ?? 50,
                    skip: input?.offset ?? 0,
                }),
                ctx.prisma.restaurant.count({ where }),
            ]);

            return { restaurants, total };
        }),

    /** Toggle restaurant published status (admin moderation) */
    toggleRestaurantPublished: adminProcedure
        .input(
            z.object({
                restaurantId: z.string().cuid(),
                userId: z.string(),
                isPublished: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.restaurant.update({
                where: {
                    id_userId: {
                        id: input.restaurantId,
                        userId: input.userId,
                    },
                },
                data: {
                    isPublished: input.isPublished,
                },
            });
        }),

    /** Get all reviews for moderation */
    getReviews: adminProcedure
        .input(
            z
                .object({
                    isHidden: z.boolean().optional(),
                    restaurantId: z.string().cuid().optional(),
                    limit: z.number().min(1).max(100).default(50),
                    offset: z.number().min(0).default(0),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const where: any = {};

            if (input?.isHidden !== undefined) {
                where.isHidden = input.isHidden;
            }

            if (input?.restaurantId) {
                where.restaurantId = input.restaurantId;
            }

            const [reviews, total] = await ctx.prisma.$transaction([
                ctx.prisma.review.findMany({
                    where,
                    include: {
                        restaurant: {
                            select: {
                                id: true,
                                name: true,
                                userId: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: input?.limit ?? 50,
                    skip: input?.offset ?? 0,
                }),
                ctx.prisma.review.count({ where }),
            ]);

            return { reviews, total };
        }),

    /** Hide a review */
    hideReview: adminProcedure.input(id).mutation(async ({ ctx, input }) => {
        return ctx.prisma.review.update({
            where: { id: input.id },
            data: { isHidden: true },
        });
    }),

    /** Unhide a review */
    unhideReview: adminProcedure.input(id).mutation(async ({ ctx, input }) => {
        return ctx.prisma.review.update({
            where: { id: input.id },
            data: { isHidden: false },
        });
    }),

    /** Delete a review permanently */
    deleteReview: adminProcedure.input(id).mutation(async ({ ctx, input }) => {
        return ctx.prisma.review.delete({
            where: { id: input.id },
        });
    }),

    /** Get platform statistics */
    getStats: adminProcedure.query(async ({ ctx }) => {
        const [totalUsers, totalRestaurants, publishedRestaurants, totalReviews, totalKeys, usedKeys] =
            await ctx.prisma.$transaction([
                ctx.prisma.user.count(),
                ctx.prisma.restaurant.count(),
                ctx.prisma.restaurant.count({ where: { isPublished: true } }),
                ctx.prisma.review.count(),
                ctx.prisma.activationKey.count(),
                ctx.prisma.activationKey.count({ where: { status: "USED" } }),
            ]);

        return {
            totalUsers,
            totalRestaurants,
            publishedRestaurants,
            totalReviews,
            totalKeys,
            usedKeys,
            unusedKeys: totalKeys - usedKeys,
        };
    }),
});
