import { NextRequest, NextResponse } from 'next/server';

// Subdomains to ignore (not user profiles)
const RESERVED_SUBDOMAINS = ['www', 'api', 'cdn', 'admin', 'app', 'mail'];

// Paths that should never be rewritten
const EXCLUDED_PATHS = [
  '/api',
  '/public',
  '/auth',
  '/dashboard',
  '/links',
  '/appearance',
  '/analytics',
  '/settings',
  '/admin',
  '/_next',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Skip excluded paths
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Extract subdomain
  // Works for: sadrachss.mysandbox.codes, sadrachss.localhost:3000
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mysandbox.codes';

  let subdomain: string | null = null;

  if (hostname.includes(baseDomain)) {
    const parts = hostname.replace(`:${request.nextUrl.port}`, '').split('.');
    // mysandbox.codes = 2 parts, sadrachss.mysandbox.codes = 3 parts
    if (parts.length > baseDomain.split('.').length) {
      subdomain = parts[0];
    }
  }

  // For localhost development: sadrachss.localhost:3000
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.')[0];
    if (parts !== 'localhost' && parts !== 'www') {
      subdomain = parts;
    }
  }

  // No subdomain or reserved — continue normally
  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  // Rewrite subdomain to /[username] path
  // sadrachss.mysandbox.codes → internally serves /sadrachss
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
