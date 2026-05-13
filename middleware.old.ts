import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'serwis_it_auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public files & auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Require auth for all app routes (including public-status if you want it public, add exception)
  const authed = req.cookies.get(AUTH_COOKIE_NAME)?.value === '1';

  // If you want /public-status truly public, uncomment:
  // if (pathname.startsWith('/public-status')) return NextResponse.next();

  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\..*).*)'],
};
