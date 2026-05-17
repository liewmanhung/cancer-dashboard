'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/')
    } else {
      setError('密码错误')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fa',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: 40,
        width: 340,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e8ecf0',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🩺</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>OncoTrack</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>请输入访问密码</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="密码"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #e8ecf0',
            fontSize: 14,
            outline: 'none',
            marginBottom: 12,
            boxSizing: 'border-box',
          }}
        />

        {error && (
          <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          进入
        </button>
      </div>
    </div>
  )
}