import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isPublicRoute = nextUrl.pathname.startsWith('/login') ||
                                  nextUrl.pathname.startsWith('/client-portal') ||
                                  nextUrl.pathname.startsWith('/api/client-portal');

            if (isPublicRoute) return true;
            if (isLoggedIn) return true;
            return false;
        },
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
