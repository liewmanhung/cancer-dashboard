'use client'

import { TreatmentRecord, MARKER_REFS, getMarkerStatus } from '@/lib/types'
import { Edit2, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Props {
  records: TreatmentRecord[]
  onEdit: (r: TreatmentRecord) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export default function RecordTable({ records, onEdit, onDelete, onAdd }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const allMarkers = [...new Set(records.flatMap(r => r.markers.map(m => m.name)))]
  const sorted = [...records].reverse()

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          暂无记录
        </h3>
        <button
          onClick={onAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-teal)',
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 8,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          <Plus size={15} />
          添加第一条记录
        </button>
      </div>
    )
  }

  const statusColor: Record<string, string> = {
    normal: 'var(--accent-emerald)',
    elevated: 'var(--accent-amber)',
    critical: 'var(--accent-rose)',
    unknown: 'var(--text-muted)',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          全部记录 <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>({records.length}条，最新在前)</span>
        </h3>
        <button
          onClick={onAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent-teal-dim)',
            color: 'var(--accent-teal)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          添加记录
        </button>
      </div>

      {/* Desktop table */}
      <div className="glass rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>治疗方案</th>
                {allMarkers.slice(0, 5).map(m => <th key={m}>{m}</th>)}
                <th>WBC</th>
                <th>HGB</th>
                <th>PLT</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(record => {
                const isExpanded = expanded === record.id
                const markerMap: Record<string, number | null> = {}
                record.markers.forEach(m => { markerMap[m.name] = m.value })

                return (
                  <>
                    <tr key={record.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpanded(isExpanded ? null : record.id)}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-teal)', whiteSpace: 'nowrap' }}>
                        {record.date}
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 200,
                        }}>
                          {record.treatment || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </div>
                      </td>

                      {allMarkers.slice(0, 5).map(name => {
                        const val = markerMap[name]
                        const status = val !== null && val !== undefined ? getMarkerStatus(name, val) : 'unknown'
                        return (
                          <td key={name}>
                            {val !== null && val !== undefined ? (
                              <span style={{ color: statusColor[status], fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13 }}>
                                {val.toLocaleString()}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        )
                      })}

                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {record.blood?.wbc != null ? (
                          <span style={{ color: (record.blood.wbc < 3.5 || record.blood.wbc > 9.5) ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                            {record.blood.wbc}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {record.blood?.hgb != null ? (
                          <span style={{ color: (record.blood.hgb < 115) ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                            {record.blood.hgb}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {record.blood?.plt != null ? (
                          <span style={{ color: (record.blood.plt < 100) ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                            {record.blood.plt}
                          </span>
                        ) : '—'}
                      </td>

                      <td>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onEdit(record)}
                            style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          {confirmDelete === record.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => { onDelete(record.id); setConfirmDelete(null) }}
                                style={{ fontSize: 10, color: 'var(--accent-rose)', background: 'var(--accent-rose-dim)', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer' }}
                              >
                                确认
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                style={{ fontSize: 10, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(record.id)}
                              style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => setExpanded(isExpanded ? null : record.id)}
                            style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {isExpanded && (
                      <tr key={`${record.id}-expanded`}>
                        <td colSpan={999} style={{ padding: 0, background: 'var(--bg-card)' }}>
                          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {record.imaging && (
                                <div>
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>影像报告</span>
                                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{record.imaging}</p>
                                </div>
                              )}
                              {record.symptoms && (
                                <div>
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>症状/副反应</span>
                                  <p style={{ fontSize: 12, color: 'var(--accent-amber)', lineHeight: 1.6 }}>{record.symptoms}</p>
                                </div>
                              )}
                              {record.notes && (
                                <div>
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>备注</span>
                                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{record.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
