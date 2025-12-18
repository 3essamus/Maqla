import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { reviewInput, restaurantId } from "src/utils/validators";

export const reviewRouter = createTRPCRouter({
    /** Submit a review (public - no auth required) */
    create: publicProcedure.input(reviewInput).mutation(async ({ ctx, input }) => {
        // Check if user already reviewed this restaurant (using fingerprint)
        const existing = await ctx.prisma.review.findUnique({
            where: {
                restaurantId_fingerprint: {
                    restaurantId: input.restaurantId,
                    fingerprint: input.fingerprint,
                },
            },
        });

        if (existing) {
            throw new TRPCError({
                code: "CONFLICT",
                message: "You have already reviewed this restaurant",
            });
        }

        // Get restaurant userId for composite key
        const restaurant = await ctx.prisma.restaurant.findFirst({
            where: { id: input.restaurantId },
            select: { userId: true },
        });

        if (!restaurant) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Restaurant not found",
            });
        }

        return ctx.prisma.review.create({
            data: {
                restaurantId: input.restaurantId,
                restaurantUserId: restaurant.userId,
                buyerName: input.buyerName,
                rating: input.rating,
                comment: input.comment,
                fingerprint: input.fingerprint,
            },
        });
    }),

    /** Get reviews for a restaurant (public) */
    getByRestaurant: publicProcedure
        .input(
            restaurantId.extend({
                limit: z.number().min(1).max(100).default(20),
                offset: z.number().min(0).default(0),
            })
        )
        .query(async ({ ctx, input }) => {
            const [reviews, total, avgRating] = await ctx.prisma.$transaction([
                ctx.prisma.review.findMany({
                    where: {
                        restaurantId: input.restaurantId,
                        isHidden: false,
                    },
                    orderBy: { createdAt: "desc" },
                    take: input.limit,
                    skip: input.offset,
                }),
                ctx.prisma.review.count({
                    where: {
                        restaurantId: input.restaurantId,
                        isHidden: false,
                    },
                }),
                ctx.prisma.review.aggregate({
                    where: {
                        restaurantId: input.restaurantId,
                        isHidden: false,
                    },
                    _avg: {
                        rating: true,
                    },
                }),
            ]);

            return {
                reviews,
                total,
                averageRating: avgRating._avg.rating ?? 0,
            };
        }),

    /** Get average rating for a restaurant */
    getAverageRating: publicProcedure.input(restaurantId).query(async ({ ctx, input }) => {
        const result = await ctx.prisma.review.aggregate({
            where: {
                restaurantId: input.restaurantId,
                isHidden: false,
            },
            _avg: {
                rating: true,
            },
            _count: true,
        });

        return {
            averageRating: result._avg.rating ?? 0,
            totalReviews: result._count,
        };
    }),
});
