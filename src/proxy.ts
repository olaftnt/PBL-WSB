import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const protectedRoutes = [
    "/dashboard",
    "/tickets",
    "/customers",
    "/devices",
    "/sla",
    "/inventory",
    "/quotes",
];

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;


    const isServerAction =
        request.method === "POST" && request.headers.has("next-action");

    if (isServerAction) {
        return NextResponse.next();
    }

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    const { data: session } = await auth.getSession();

    if (!session?.user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

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