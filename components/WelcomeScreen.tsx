'use client'

import { useState } from 'react'
import { Activity, Plus, FileUp, TrendingUp, Brain, FileText } from 'lucide-react'

interface WelcomeScreenProps {
  onAddPatient: (name: string) => void
}

export default function WelcomeScreen({ onAddPatient }: WelcomeScreenProps) {
  const [name, setName] = useState('')

  const features = [
    {
      icon: <FileUp size={20} />,
      title: '📄 图片识别上传',
      desc: '拍照上传检验报告，AI自动提取标志物数值',
      color: 'var(--accent-teal)',
      dim: 'var(--accent-teal-dim)',
    },
    {
      icon: <TrendingUp size={20} />,
      title: '📈 动态曲线图',
      desc: '肿瘤标志物、血常规历史趋势可视化',
      color: 'var(--accent-emerald)',
      dim: 'var(--accent-emerald-dim)',
    },
    {
      icon: <Brain size={20} />,
      title: '🤖 AI 医学分析',
      desc: 'Grok AI 对治疗效果提供专业参考意见',
      color: 'var(--accent-violet)',
      dim: 'var(--accent-violet-dim)',
    },
    {
      icon: <FileText size={20} />,
      title: '📑 PDF 报告导出',
      desc: '一键生成含图表和AI分析的完整报告',
      color: 'var(--accent-amber)',
      dim: 'var(--accent-amber-dim)',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(ellipse, rgba(56,189,248,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(56,189,248,0.15)', animationDuration: '3s' }} />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full"
              style={{ background: 'var(--accent-teal-dim)', border: '2px solid rgba(56,189,248,0.3)' }}>
              <Activity size={36} style={{ color: 'var(--accent-teal)' }} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 48,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          OncoTrack
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}>
          智能癌症治疗追踪仪表盘
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 40 }}>
          AI-Powered · 本地存储 · 支持图片识别 · Vercel 部署
        </p>

        {/* Add patient form */}
        <div className="glass rounded-2xl p-6 mb-8 text-left" style={{ border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            创建第一个患者档案
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && onAddPatient(name.trim())}
              placeholder="输入患者姓名（例：张三）"
              style={{
                flex: 1,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-accent)',
                borderRadius: 10,
                padding: '10px 14px',
                color: 'var(--text-primary)',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              onClick={() => name.trim() && onAddPatient(name.trim())}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--accent-teal)',
                color: '#0a0f1a',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={16} />
              开始追踪
            </button>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={i} className="glass rounded-xl p-4 text-left transition-smooth glass-hover"
              style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: f.dim,
                  color: f.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {f.title}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 24 }}>
          ⚕️ 本工具仅供辅助参考，不能替代专业医疗诊断。请遵循主治医师指导。
        </p>
      </div>
    </div>
  )
}
