import { NextRequest, NextResponse } from 'next/server'

const REDIRECT_PATHS = new Set(['/', '/login', '/register'])

export function proxy(request: NextRequest) {
  if (!REDIRECT_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const sessionToken =
    request.cookies.get('__Secure-better-auth.session_token') ??
    request.cookies.get('better-auth.session_token')

  if (sessionToken?.value) {
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard/tier-lists', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register'],
}
