import { type DefaultSession } from "next-auth";
import { type UserRole, type UserTier } from "@prisma/client";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user?: {
            id: string;
            role: UserRole;
            tier: UserTier;
            tierExpiresAt: Date | null;
        } & DefaultSession["user"];
    }
}
