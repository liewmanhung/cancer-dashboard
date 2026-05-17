import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD
  if (!password) return NextResponse.next()

  const cookie = request.cookies.get('auth')
  if (cookie?.value === password) return NextResponse.next()

  // Allow the login page itself
  if (request.nextUrl.pathname === '/login') return NextResponse.next()

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!api|_next|favicon).*)'],
}