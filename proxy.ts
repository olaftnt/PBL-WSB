import { auth } from '@/lib/auth/server';

export default auth.middleware({
    loginUrl: '/login',
});

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/customers/:path*',
        '/devices/:path*',
        '/tickets/:path*',
        '/parts/:path*',
        '/quotes/:path*',
    ],
};