import { NextResponse, type NextRequest } from 'next/server';

const legacyRouteRedirects: Array<{ from: RegExp; to: string }> = [
  { from: /^\/scenario-models\/?$/, to: '/scenario-lab' },
  { from: /^\/financial-impact\/?$/, to: '/scenario-lab' },
  { from: /^\/competitors\/?$/, to: '/' },
  { from: /^\/signals\/?$/, to: '/' },
  { from: /^\/markets(?:\/.*)?$/, to: '/scenario-lab' },
  { from: /^\/documents\/?$/, to: '/intelligence' },
  { from: /^\/database\/?$/, to: '/intelligence' },
  { from: /^\/timeline\/?$/, to: '/intelligence' },
  { from: /^\/how-it-works\/?$/, to: '/' },
  { from: /^\/portfolio(?:\/.*)?$/, to: '/' },
  { from: /^\/brands(?:\/.*)?$/, to: '/' },
  { from: /^\/brand(?:\/.*)?$/, to: '/' },
  { from: /^\/learn(?:\/.*)?$/, to: '/' },
  { from: /^\/wiki(?:\/.*)?$/, to: '/' },
  { from: /^\/start-here\/?$/, to: '/' },
  { from: /^\/agent-lab\/?$/, to: '/' },
  { from: /^\/avatar-test\/?$/, to: '/' },
  { from: /^\/atlas-thinking\/?$/, to: '/' }
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const redirect = legacyRouteRedirects.find((item) => item.from.test(pathname));

  if (!redirect) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = redirect.to;
  url.search = redirect.to === '/scenario-lab' || redirect.to === '/intelligence'
    ? search
    : '';

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/financial-impact',
    '/scenario-models',
    '/competitors',
    '/signals',
    '/markets/:path*',
    '/documents',
    '/database',
    '/timeline',
    '/how-it-works',
    '/portfolio/:path*',
    '/brands/:path*',
    '/brand/:path*',
    '/learn/:path*',
    '/wiki/:path*',
    '/start-here',
    '/agent-lab',
    '/avatar-test',
    '/atlas-thinking'
  ]
};
