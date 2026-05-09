import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { messages, model = 'deepseek-v4-pro' } = body

  const isVision = messages.some((m: any) => 
    Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url')
  )

  const apiKey = isVision ? process.env.GROK_API_KEY : process.env.DEEPSEEK_API_KEY
  const apiUrl = isVision
    ? 'https://api.x.ai/v1/chat/completions'
    : 'https://api.deepseek.com/chat/completions'
  const finalModel = isVision ? 'grok-2-vision-1212' : model

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: finalModel,
        messages,
        max_tokens: 2000,
        temperature: 0.3,
        stream: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: err }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}