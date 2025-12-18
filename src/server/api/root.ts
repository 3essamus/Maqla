import { activationRouter } from "./routers/activation.router";
import { adminRouter } from "./routers/admin.router";
import { categoryRouter } from "./routers/category.router";
import { menuRouter } from "./routers/menu.router";
import { menuItemRouter } from "./routers/menuItem.router";
import { restaurantRouter } from "./routers/restaurant.router";
import { reviewRouter } from "./routers/review.router";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
    activation: activationRouter,
    admin: adminRouter,
    category: categoryRouter,
    menu: menuRouter,
    menuItem: menuItemRouter,
    restaurant: restaurantRouter,
    review: reviewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
