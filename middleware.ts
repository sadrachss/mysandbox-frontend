import { NextRequest, NextResponse } from 'next/server';

const RESERVED_SUBDOMAINS = ['www', 'api', 'cdn', 'admin', 'app', 'mail'];

const EXCLUDED_PATHS = [
  '/api',
  '/public',
  '/auth',
  '/dashboard',
  '/links',
  '/appearance',
  '/analytics',
  '/settings',
  '/_next',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mysandbox.codes';

  let subdomain: string | null = null;

  if (hostname.includes(baseDomain)) {
    const parts = hostname.replace(`:${request.nextUrl.port}`, '').split('.');
    if (parts.length > baseDomain.split('.').length) {
      subdomain = parts[0];
    }
  }

  if (hostname.includes('localhost')) {
    const parts = hostname.split('.')[0];
    if (parts !== 'localhost' && parts !== 'www') {
      subdomain = parts;
    }
  }

  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
