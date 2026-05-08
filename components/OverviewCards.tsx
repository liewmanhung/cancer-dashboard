'use client'

import { PatientProfile, TreatmentRecord, MARKER_REFS, getMarkerStatus } from '@/lib/types'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface Props {
  patient: PatientProfile
  records: TreatmentRecord[]
  onEdit: (r: TreatmentRecord) => void
}

export default function OverviewCards({ patient, records, onEdit }: Props) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          暂无治疗记录
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          点击「手动录入」或「上传报告」添加第一条记录
        </p>
      </div>
    )
  }

  const latest = records[records.length - 1]
  const prev = records.length > 1 ? records[records.length - 2] : null

  // Build marker summary from all records
  const allMarkerNames = [...new Set(records.flatMap(r => r.markers.map(m => m.name)))]

  // Stats for each marker
  const markerStats = allMarkerNames.map(name => {
    const vals = records
      .flatMap(r => r.markers.filter(m => m.name === name))
      .filter(m => m.value !== null)
    if (vals.length === 0) return null

    const latest = vals[vals.length - 1].value!
    const prev = vals.length > 1 ? vals[vals.length - 2].value! : null
    const trend = prev !== null ? (latest - prev) / Math.max(prev, 0.001) : 0
    const ref = MARKER_REFS[name.toUpperCase()]
    const status = ref ? getMarkerStatus(name, latest) : 'unknown'

    return { name, latest, prev, trend, ref, status, count: vals.length }
  }).filter((m): m is NonNullable<typeof m> => m !== null)

  // Last blood test
  const lastBlood = [...records].reverse().find(r => r.blood && Object.values(r.blood).some(v => v != null))?.blood

  const statusColor = {
    normal: 'var(--accent-emerald)',
    elevated: 'var(--accent-amber)',
    critical: 'var(--accent-rose)',
    unknown: 'var(--text-muted)',
  }
  const statusBg = {
    normal: 'var(--accent-emerald-dim)',
    elevated: 'var(--accent-amber-dim)',
    critical: 'var(--accent-rose-dim)',
    unknown: 'var(--bg-card)',
  }

  return (
    <div className="space-y-5">
      {/* Summary stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: '治疗记录',
            value: records.length,
            unit: '条',
            icon: <Clock size={18} />,
            color: 'var(--accent-teal)',
            dim: 'var(--accent-teal-dim)',
          },
          {
            label: '最近记录',
            value: latest.date,
            unit: '',
            icon: <CheckCircle size={18} />,
            color: 'var(--accent-emerald)',
            dim: 'var(--accent-emerald-dim)',
          },
          {
            label: '监测指标',
            value: allMarkerNames.length,
            unit: '项',
            icon: <TrendingUp size={18} />,
            color: 'var(--accent-violet)',
            dim: 'var(--accent-violet-dim)',
          },
          {
            label: '异常指标',
            value: markerStats.filter(m => m.status !== 'normal' && m.status !== 'unknown').length,
            unit: '项',
            icon: <AlertTriangle size={18} />,
            color: 'var(--accent-amber)',
            dim: 'var(--accent-amber-dim)',
          },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4"
            style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: stat.dim, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {stat.icon}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {stat.value}
              {stat.unit && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>{stat.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Latest record highlight */}
      <div className="glass rounded-xl p-5 scan-line" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            最新记录 · {latest.date}
          </h3>
          <button
            onClick={() => onEdit(latest)}
            style={{
              fontSize: 12, color: 'var(--accent-teal)',
              background: 'var(--accent-teal-dim)',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
            }}
          >
            编辑
          </button>
        </div>

        {latest.treatment && (
          <div className="mb-3 px-3 py-2 rounded-lg"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="section-label" style={{ display: 'block', marginBottom: 4 }}>治疗方案</span>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {latest.treatment}
            </p>
          </div>
        )}

        {latest.markers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {latest.markers.map(m => {
              const status = m.value !== null ? getMarkerStatus(m.name, m.value!) : 'unknown'
              const ref = MARKER_REFS[m.name.toUpperCase()]
              return (
                <div key={m.name} className="rounded-lg p-3"
                  style={{ background: statusBg[status], border: `1px solid ${statusColor[status]}22` }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: statusColor[status], fontFamily: 'var(--font-mono)' }}>
                    {m.value?.toLocaleString() ?? '-'}
                  </div>
                  {ref && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      正常 ≤{ref.max} {ref.unit}
                    </div>
                  )}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    marginTop: 4,
                    fontSize: 10,
                    color: statusColor[status],
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {status === 'critical' ? '⚠ 危急' : status === 'elevated' ? '↑ 偏高' : status === 'normal' ? '✓ 正常' : '–'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {latest.symptoms && (
          <div className="mt-3 px-3 py-2 rounded-lg"
            style={{ background: 'var(--accent-amber-dim)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <span style={{ fontSize: 11, color: 'var(--accent-amber)', fontWeight: 600 }}>症状/不良反应：</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 6 }}>{latest.symptoms}</span>
          </div>
        )}
      </div>

      {/* Marker trend cards */}
      {markerStats.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
            指标趋势总览
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {markerStats.map(stat => {
              const trendPct = stat.trend ? (stat.trend * 100).toFixed(1) : null
              const isUp = stat.trend > 0.01
              const isDown = stat.trend < -0.01
              const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus
              const trendColor = isUp ? 'var(--accent-rose)' : isDown ? 'var(--accent-emerald)' : 'var(--text-muted)'

              return (
                <div key={stat.name} className="glass rounded-xl p-4 glass-hover transition-smooth"
                  style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{stat.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: trendColor, fontSize: 11 }}>
                      <TrendIcon size={13} />
                      {trendPct && <span>{Math.abs(parseFloat(trendPct))}%</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: statusColor[stat.status], fontFamily: 'var(--font-mono)' }}>
                    {stat.latest.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    {stat.ref?.unit} · {stat.count}次测量
                  </div>
                  {stat.prev !== null && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      前次: {stat.prev.toLocaleString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Blood test overview */}
      {lastBlood && (
        <div className="glass rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
            最新血常规
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: 'WBC', value: lastBlood.wbc, unit: '×10⁹/L', min: 3.5, max: 9.5 },
              { label: 'HGB', value: lastBlood.hgb, unit: 'g/L', min: 115, max: 150 },
              { label: 'PLT', value: lastBlood.plt, unit: '×10⁹/L', min: 125, max: 350 },
              { label: 'NEUT', value: lastBlood.neutrophil, unit: '×10⁹/L', min: 1.5, max: 7 },
              { label: 'ALT', value: lastBlood.alt, unit: 'U/L', max: 40 },
              { label: 'AST', value: lastBlood.ast, unit: 'U/L', max: 40 },
            ].filter(b => b.value != null).map(b => {
              const val = b.value!
              const abnormal = val > b.max || (b.min && val < b.min)
              return (
                <div key={b.label} className="text-center rounded-lg p-2"
                  style={{
                    background: abnormal ? 'var(--accent-rose-dim)' : 'var(--bg-card)',
                    border: `1px solid ${abnormal ? 'rgba(251,113,133,0.2)' : 'var(--border)'}`,
                  }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{b.label}</div>
                  <div style={{
                    fontSize: 18, fontWeight: 700,
                    color: abnormal ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {val}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{b.unit}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
