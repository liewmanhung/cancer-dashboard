import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const correct = process.env.APP_PASSWORD

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('auth', correct, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30天
    path: '/',
  })
  return res
}