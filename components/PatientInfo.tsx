'use client'

import { useState } from 'react'
import { PatientProfile } from '@/lib/types'
import { Save } from 'lucide-react'

interface Props {
  patient: PatientProfile
  onUpdate: (p: PatientProfile) => void
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-accent)',
  borderRadius: 8,
  padding: '9px 13px',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'var(--font-body)',
}

const labelStyle = {
  fontSize: 11,
  color: 'var(--text-muted)',
  marginBottom: 6,
  display: 'block',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
}

export default function PatientInfo({ patient, onUpdate }: Props) {
  const [name, setName] = useState(patient.name)
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis || '')
  const [pathology, setPathology] = useState(patient.pathology || '')
  const [genetics, setGenetics] = useState(patient.genetics || '')
  const [firstDiagnosisDate, setFirstDiagnosisDate] = useState(patient.firstDiagnosisDate || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onUpdate({
      ...patient,
      name,
      diagnosis,
      pathology,
      genetics,
      firstDiagnosisDate,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
        患者基本信息
      </h3>

      <div className="glass rounded-xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
        <div>
          <label style={labelStyle}>患者姓名</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>确诊时间</label>
          <input type="date" value={firstDiagnosisDate} onChange={e => setFirstDiagnosisDate(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>诊断/肿瘤范围</label>
          <textarea
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            rows={3}
            placeholder="如：胃癌（pT3N2M0），腹腔多发转移..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle}>免疫组化 (Pathology)</label>
          <textarea
            value={pathology}
            onChange={e => setPathology(e.target.value)}
            rows={2}
            placeholder="如：MMR(pMMR) CPS(2) HER2(-) ..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle}>基因检测 (Genetics)</label>
          <textarea
            value={genetics}
            onChange={e => setGenetics(e.target.value)}
            rows={2}
            placeholder="如：MSI(MSS) NTRK(-) BRAF(V600E突变) ..."
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: saved ? 'var(--accent-emerald)' : 'var(--accent-teal)',
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 9,
            padding: '9px 20px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Save size={15} />
          {saved ? '✓ 已保存' : '保存信息'}
        </button>
      </div>

      {/* Stats */}
      <div className="glass rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>档案统计</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: '治疗记录', value: patient.records.length },
            {
              label: '监测天数',
              value: patient.records.length > 1
                ? Math.round(
                    (new Date(patient.records[patient.records.length - 1].date).getTime()
                      - new Date(patient.records[0].date).getTime())
                    / (1000 * 60 * 60 * 24)
                  )
                : 0,
            },
            {
              label: '指标类型',
              value: new Set(patient.records.flatMap(r => r.markers.map(m => m.name))).size,
            },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px', background: 'var(--bg-card)', borderRadius: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          创建时间: {new Date(patient.createdAt).toLocaleDateString('zh-CN')} ·
          最后更新: {new Date(patient.updatedAt).toLocaleDateString('zh-CN')}
        </div>
      </div>
    </div>
  )
}
