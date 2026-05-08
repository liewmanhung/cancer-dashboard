import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cancer Treatment Dashboard | 抗癌治疗仪表盘',
  description: 'AI-powered cancer treatment tracking and analysis dashboard',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🩺</text></svg>",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
