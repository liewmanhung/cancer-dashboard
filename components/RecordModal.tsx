'use client'

import { useState, useEffect } from 'react'
import { TreatmentRecord, TumorMarker, BloodTest } from '@/lib/types'
import { generateId } from '@/lib/storage'
import { X, Plus, Trash2 } from 'lucide-react'

interface Props {
  record: TreatmentRecord | null
  onSave: (r: TreatmentRecord) => void
  onClose: () => void
}

const COMMON_MARKERS = ['CEA', 'CA199', 'CA125', 'CA153', 'CA724', 'AFP']

const inputStyle = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-accent)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'var(--font-body)',
}

const labelStyle = {
  fontSize: 11,
  color: 'var(--text-muted)',
  marginBottom: 5,
  display: 'block',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
}

export default function RecordModal({ record, onSave, onClose }: Props) {
  const [date, setDate] = useState(record?.date || new Date().toISOString().slice(0, 10))
  const [treatment, setTreatment] = useState(record?.treatment || '')
  const [markers, setMarkers] = useState<TumorMarker[]>(
    record?.markers || COMMON_MARKERS.map(n => ({ name: n, value: null }))
  )
  const [blood, setBlood] = useState<BloodTest>(record?.blood || {})
  const [imaging, setImaging] = useState(record?.imaging || '')
  const [symptoms, setSymptoms] = useState(record?.symptoms || '')
  const [notes, setNotes] = useState(record?.notes || '')
  const [customMarkerName, setCustomMarkerName] = useState('')

  const handleSave = () => {
    const cleaned = markers.filter(m => m.value !== null && m.name.trim())
    onSave({
      id: record?.id || generateId(),
      date,
      treatment: treatment || undefined,
      markers: cleaned,
      blood: Object.keys(blood).length > 0 ? blood : undefined,
      imaging: imaging || undefined,
      symptoms: symptoms || undefined,
      notes: notes || undefined,
    })
  }

  const updateMarker = (idx: number, field: keyof TumorMarker, value: string) => {
    const next = [...markers]
    if (field === 'value') {
      next[idx] = { ...next[idx], value: value === '' ? null : parseFloat(value) }
    } else {
      next[idx] = { ...next[idx], [field]: value }
    }
    setMarkers(next)
  }

  const addCustomMarker = () => {
    const n = customMarkerName.trim().toUpperCase()
    if (!n) return
    setMarkers([...markers, { name: n, value: null }])
    setCustomMarkerName('')
  }

  const removeMarker = (idx: number) => {
    setMarkers(markers.filter((_, i) => i !== idx))
  }

  const updateBlood = (key: keyof BloodTest, val: string) => {
    setBlood({ ...blood, [key]: val === '' ? undefined : parseFloat(val) })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-secondary)',
          borderRadius: '16px 16px 0 0',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {record ? '编辑记录' : '添加治疗记录'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Date + Treatment */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label style={labelStyle}>日期 *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>治疗方案</label>
              <input
                type="text"
                value={treatment}
                onChange={e => setTreatment(e.target.value)}
                placeholder="如：贝伐300mg + 奥沙利铂..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Tumor markers */}
          <div className="mb-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>肿瘤标志物</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMarkerName}
                  onChange={e => setCustomMarkerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomMarker()}
                  placeholder="自定义指标名"
                  style={{ ...inputStyle, width: 120, padding: '4px 8px' }}
                />
                <button onClick={addCustomMarker}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px',
                    background: 'var(--accent-teal-dim)',
                    color: 'var(--accent-teal)',
                    border: '1px solid rgba(56,189,248,0.2)',
                    borderRadius: 6, fontSize: 11, cursor: 'pointer',
                  }}>
                  <Plus size={12} />添加
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {markers.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{m.name}</div>
                    <input
                      type="number"
                      step="0.01"
                      value={m.value ?? ''}
                      onChange={e => updateMarker(i, 'value', e.target.value)}
                      placeholder="数值"
                      style={{ ...inputStyle, padding: '6px 10px' }}
                    />
                  </div>
                  {!COMMON_MARKERS.includes(m.name) && (
                    <button onClick={() => removeMarker(i)}
                      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 16 }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blood tests */}
          <div className="mb-5">
            <label style={labelStyle}>血常规</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['wbc', 'WBC (×10⁹/L)', '白细胞'],
                ['hgb', 'HGB (g/L)', '血红蛋白'],
                ['plt', 'PLT (×10⁹/L)', '血小板'],
                ['neutrophil', 'NEUT', '中性粒细胞'],
                ['creatinine', 'Cr (μmol/L)', '血肌酐'],
                ['alt', 'ALT (U/L)', '谷丙转氨酶'],
                ['ast', 'AST (U/L)', '谷草转氨酶'],
                ['tbil', 'TBIL (μmol/L)', '总胆红素'],
              ] as const).map(([key, label, hint]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>
                    {label}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={blood[key as keyof BloodTest] ?? ''}
                    onChange={e => updateBlood(key as keyof BloodTest, e.target.value)}
                    placeholder={hint}
                    style={{ ...inputStyle, padding: '6px 10px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Imaging */}
          <div className="mb-4">
            <label style={labelStyle}>影像报告</label>
            <textarea
              value={imaging}
              onChange={e => setImaging(e.target.value)}
              rows={3}
              placeholder="CT/MRI/PET报告描述..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Symptoms */}
          <div className="mb-4">
            <label style={labelStyle}>症状/不良反应</label>
            <textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              rows={2}
              placeholder="治疗期间的症状、副反应..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label style={labelStyle}>备注</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="其他备注..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                background: 'var(--accent-teal)',
                color: '#0a0f1a',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {record ? '保存修改' : '添加记录'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
