import { neonAuthMiddleware } from "@neondatabase/neon-js/auth/next";

export default neonAuthMiddleware({
    // Redirects unauthenticated users to sign-in page
    loginUrl: "/auth/sign-in",
});

export const config = {
    matcher: [
        // Protected routes requiring authentication
        "/account/:path*",
    ],
};