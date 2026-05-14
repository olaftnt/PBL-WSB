import { auth } from "@/lib/auth/server";

console.log("PROXY FILE LOADED");

export default auth.middleware({
    loginUrl: "/login",
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/tickets/:path*",
        "/customers/:path*",
        "/devices/:path*",
        "/sla/:path*",
        "/inventory/:path*",
        "/quotes/:path*",
    ],
};