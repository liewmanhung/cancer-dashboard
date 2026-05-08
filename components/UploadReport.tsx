'use client'

import { useState, useRef, useCallback } from 'react'
import { TreatmentRecord } from '@/lib/types'
import { analyzeReportImage } from '@/lib/grok'
import { Upload, ImageIcon, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

interface Props {
  onRecordExtracted: (r: Partial<TreatmentRecord>) => void
}

type Status = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error'

export default function UploadReport({ onRecordExtracted }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [extracted, setExtracted] = useState<Partial<TreatmentRecord> | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('请上传图片文件（JPG, PNG, WEBP）')
      return
    }

    setFileName(file.name)
    setStatus('uploading')
    setError('')
    setExtracted(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1]
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setStatus('analyzing')

      try {
        const result = await analyzeReportImage(base64, file.type)
        setExtracted(result)
        setStatus('success')
      } catch (err) {
        setError(String(err))
        setStatus('error')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleConfirm = () => {
    if (extracted) {
      onRecordExtracted(extracted)
      setStatus('idle')
      setPreview(null)
      setExtracted(null)
      setFileName('')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setPreview(null)
    setExtracted(null)
    setFileName('')
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          📄 上传检验报告
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          支持拍照上传检验单、CT报告等图片，Grok Vision AI 将自动提取数据
        </p>
      </div>

      {/* Upload zone */}
      {status === 'idle' && (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} flex flex-col items-center justify-center`}
          style={{ minHeight: 220, cursor: 'pointer', borderRadius: 16 }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--accent-teal-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Upload size={28} style={{ color: 'var(--accent-teal)' }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            拖拽图片到此处，或点击选择
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            支持 JPG · PNG · WEBP · 最大 10MB
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Analyzing state */}
      {(status === 'uploading' || status === 'analyzing') && (
        <div className="glass rounded-xl p-8 flex flex-col items-center justify-center"
          style={{ border: '1px solid var(--border)', minHeight: 220 }}>
          {preview && (
            <img src={preview} alt="Report preview"
              style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, marginBottom: 16, opacity: 0.6 }} />
          )}
          <div className="flex items-center gap-3">
            <Loader2 size={20} style={{ color: 'var(--accent-teal)', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {status === 'uploading' ? '读取文件中...' : 'Grok AI 分析报告中...'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{fileName}</p>

          <div style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, background: 'var(--accent-teal-dim)', border: '1px solid rgba(56,189,248,0.15)' }}>
            <p style={{ fontSize: 11, color: 'var(--accent-teal)', textAlign: 'center' }}>
              🤖 AI正在识别标志物数值、血常规、影像报告描述...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="glass rounded-xl p-6" style={{ border: '1px solid rgba(251,113,133,0.2)' }}>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={20} style={{ color: 'var(--accent-rose)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-rose)' }}>分析失败</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            {error.includes('GROK_API_KEY') ? '请先配置 GROK_API_KEY 环境变量' : error}
          </p>
          <button onClick={handleReset} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
          }}>
            重新上传
          </button>
        </div>
      )}

      {/* Success state */}
      {status === 'success' && extracted && (
        <div className="space-y-4">
          <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid rgba(52,211,153,0.2)' }}>
            <div style={{
              background: 'var(--accent-emerald-dim)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-emerald)' }}>
                  AI提取完成，请确认数据
                </span>
              </div>
              <button onClick={handleReset} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 16 }}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Date */}
                {extracted.date && (
                  <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>日期</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {extracted.date}
                    </div>
                  </div>
                )}

                {/* Treatment */}
                {extracted.treatment && (
                  <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>治疗方案</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{extracted.treatment}</div>
                  </div>
                )}
              </div>

              {/* Markers */}
              {extracted.markers && extracted.markers.length > 0 && (
                <div className="mb-4">
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    肿瘤标志物
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {extracted.markers.map(m => (
                      <div key={m.name} style={{
                        background: 'var(--bg-card)', borderRadius: 8, padding: '8px 10px',
                        border: '1px solid var(--border)', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blood */}
              {extracted.blood && Object.values(extracted.blood).some(v => v != null) && (
                <div className="mb-4">
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    血常规
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(extracted.blood)
                      .filter(([, v]) => v != null)
                      .map(([k, v]) => (
                        <div key={k} style={{
                          background: 'var(--bg-card)', borderRadius: 8, padding: '8px 10px',
                          border: '1px solid var(--border)', textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>
                            {k.toUpperCase()}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {String(v)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Imaging / symptoms */}
              {(extracted.imaging || extracted.symptoms) && (
                <div className="space-y-2">
                  {extracted.imaging && (
                    <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>影像报告</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{extracted.imaging}</p>
                    </div>
                  )}
                  {extracted.symptoms && (
                    <div style={{ background: 'var(--accent-amber-dim)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(251,191,36,0.15)' }}>
                      <div style={{ fontSize: 10, color: 'var(--accent-amber)', marginBottom: 3 }}>症状/副反应</div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{extracted.symptoms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  background: 'var(--accent-emerald)',
                  color: '#0a0f1a',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✓ 确认导入
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                重新上传
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="glass rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
          💡 使用建议
        </p>
        <ul style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 16 }}>
          <li>建议上传清晰的正面照片，避免光线过暗或模糊</li>
          <li>支持血液检验报告、肿瘤标志物检测报告、CT报告等</li>
          <li>AI提取后请仔细核对数值，确认后再导入</li>
          <li>需要配置 GROK_API_KEY 环境变量才能使用此功能</li>
        </ul>
      </div>
    </div>
  )
}
