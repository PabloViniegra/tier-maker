import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('better-auth.session_token')

  if (sessionToken?.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
