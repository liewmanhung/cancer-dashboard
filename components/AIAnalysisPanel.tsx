'use client'

import { useState, useRef, useEffect } from 'react'
import { PatientProfile } from '@/lib/types'
import { chatWithAI } from '@/lib/grok'
import { Brain, Send, RefreshCw } from 'lucide-react'

interface Props {
  analysis: string
  loading: boolean
  patient: PatientProfile
  onRegenerate: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAnalysisPanel({ analysis, loading, patient, onRegenerate }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const handleChat = async () => {
    const msg = input.trim()
    if (!msg || chatLoading) return

    const newMessages = [...messages, { role: 'user' as const, content: msg }]
    setMessages(newMessages)
    setInput('')
    setChatLoading(true)

    try {
      const reply = await chatWithAI(
        msg,
        patient,
        newMessages.map(m => ({ role: m.role, content: m.content }))
      )
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: '❌ 请求失败。请检查 GROK_API_KEY 是否配置正确。\n\n错误: ' + String(err)
      }])
    } finally {
      setChatLoading(false)
    }
  }

  // Render markdown-like content
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} style={{
            fontSize: 14, fontWeight: 700, color: 'var(--accent-teal)',
            marginTop: i > 0 ? 20 : 0, marginBottom: 8,
            paddingBottom: 6,
            borderBottom: '1px solid var(--border)',
          }}>
            {line.replace('## ', '')}
          </h3>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 12, marginBottom: 4 }}>
            {line.replace('### ', '')}
          </h4>
        )
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 8 }}>
            <span style={{ color: 'var(--accent-teal)', flexShrink: 0 }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {line.replace(/^[-•]\s/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
            </span>
          </div>
        )
      }
      if (line.startsWith('---')) {
        return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
      }
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return (
          <p key={i} style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 8, lineHeight: 1.6 }}>
            {line.replace(/^\*|\*$/g, '')}
          </p>
        )
      }
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />
      return (
        <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 4 }}
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
              .replace(/`(.*?)`/g, '<code style="font-family:var(--font-mono);font-size:11px;background:var(--bg-card);padding:1px 5px;border-radius:3px;color:var(--accent-teal)">$1</code>')
          }}
        />
      )
    })
  }

  return (
    <div className="space-y-5">
      {/* Analysis section */}
      <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
        }}>
          <div className="flex items-center gap-2">
            <Brain size={16} style={{ color: 'var(--accent-violet)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>AI 医学分析报告</span>
          </div>
          <button
            onClick={onRegenerate}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: loading ? 'var(--bg-card)' : 'var(--accent-violet-dim)',
              color: loading ? 'var(--text-muted)' : 'var(--accent-violet)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 7,
              fontSize: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 12, height: 12 }} />
            ) : (
              <RefreshCw size={13} />
            )}
            {loading ? '分析中...' : '重新分析'}
          </button>
        </div>

        <div style={{ padding: 20, minHeight: 200 }}>
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--accent-violet)',
                    animation: `pulseDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Grok AI 正在分析患者数据...
              </p>
            </div>
          )}
          {!loading && !analysis && (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
              <Brain size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                点击顶部「AI分析」按钮或「重新分析」生成报告
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                需要至少1条治疗记录，且配置GROK_API_KEY
              </p>
            </div>
          )}
          {!loading && analysis && (
            <div>{renderMarkdown(analysis)}</div>
          )}
        </div>
      </div>

      {/* Chat section */}
      <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            💬 AI 问诊助手
          </span>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            基于患者记录的AI答疑 · 仅供参考，不构成医疗建议
          </p>
        </div>

        {/* Messages */}
        <div style={{ height: 320, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                可以询问关于指标、治疗效果等问题
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'CEA指标有什么临床意义？',
                  '白细胞偏低要注意什么？',
                  '治疗效果如何评估？',
                ].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    style={{
                      fontSize: 11,
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'var(--accent-teal-dim)' : 'var(--bg-card)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(56,189,248,0.2)' : 'var(--border)'}`,
                color: 'var(--text-secondary)',
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '14px 14px 14px 4px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--text-muted)',
                    animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
            placeholder="输入问题，Enter发送..."
            style={{
              flex: 1,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-accent)',
              borderRadius: 10,
              padding: '8px 14px',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            onClick={handleChat}
            disabled={chatLoading || !input.trim()}
            style={{
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: chatLoading || !input.trim() ? 'var(--bg-card)' : 'var(--accent-teal)',
              color: chatLoading || !input.trim() ? 'var(--text-muted)' : '#0a0f1a',
              border: 'none',
              borderRadius: 10,
              cursor: chatLoading || !input.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
