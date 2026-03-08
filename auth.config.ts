import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id || token.sub;
            }
            return session;
        },
    },
    secret: "secret-shhh",
    providers: [], // Providers will be added in auth.ts
} satisfies NextAuthConfig;
