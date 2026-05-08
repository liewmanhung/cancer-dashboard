'use client'

import { useState } from 'react'
import { PatientProfile } from '@/lib/types'
import { ChevronLeft, ChevronRight, Plus, Trash2, User, Activity, X } from 'lucide-react'

interface SidebarProps {
  patients: PatientProfile[]
  activePatientId: string | null
  onSelectPatient: (id: string) => void
  onAddPatient: (name: string) => void
  onDeletePatient: (id: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({
  patients, activePatientId, onSelectPatient, onAddPatient, onDeletePatient, isOpen, onToggle
}: SidebarProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    onAddPatient(name)
    setNewName('')
    setAdding(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onToggle}
        />
      )}

      <aside
        className="relative flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0"
        style={{
          width: isOpen ? 260 : 0,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
          minWidth: isOpen ? 260 : 0,
        }}
      >
        <div style={{ width: 260 }}>
          {/* Logo header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ background: 'var(--accent-teal-dim)' }}>
                <Activity size={16} style={{ color: 'var(--accent-teal)' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-primary)', fontWeight: 600 }}>
                  OncoTrack
                </div>
                <div className="section-label" style={{ fontSize: 9 }}>抗癌治疗追踪</div>
              </div>
            </div>
            <button onClick={onToggle}
              className="transition-smooth"
              style={{ color: 'var(--text-muted)', padding: 4 }}>
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Patients list */}
          <div className="px-3 py-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="section-label">患者档案</span>
              <button
                onClick={() => setAdding(!adding)}
                className="transition-smooth"
                style={{
                  color: adding ? 'var(--accent-rose)' : 'var(--text-muted)',
                  padding: '2px 6px',
                  borderRadius: 6,
                  background: adding ? 'var(--accent-rose-dim)' : 'transparent',
                }}
              >
                {adding ? <X size={14} /> : <Plus size={14} />}
              </button>
            </div>

            {/* Add patient form */}
            {adding && (
              <div className="mb-3 p-2 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="输入患者姓名..."
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    padding: '4px 2px',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAdd}
                    style={{
                      flex: 1,
                      background: 'var(--accent-teal)',
                      color: '#0a0f1a',
                      border: 'none',
                      borderRadius: 6,
                      padding: '5px 8px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    添加
                  </button>
                  <button
                    onClick={() => { setAdding(false); setNewName('') }}
                    style={{
                      padding: '5px 8px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      color: 'var(--text-muted)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Patient items */}
            <div className="flex flex-col gap-1">
              {patients.length === 0 && (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  <User size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p>暂无患者档案</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>点击 + 添加患者</p>
                </div>
              )}
              {patients.map(patient => {
                const isActive = patient.id === activePatientId
                const lastRecord = patient.records[patient.records.length - 1]

                return (
                  <div key={patient.id} className="relative group">
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="w-full text-left transition-smooth rounded-lg px-3 py-2.5"
                      style={{
                        background: isActive ? 'var(--accent-teal-dim)' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(56,189,248,0.2)' : 'transparent'}`,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive ? 'var(--accent-teal)' : 'var(--bg-card)',
                            color: isActive ? '#0a0f1a' : 'var(--text-muted)',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700 }}>
                            {patient.name[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isActive ? 'var(--accent-teal)' : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {patient.name}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {patient.records.length} 条记录
                            {lastRecord && ` · ${lastRecord.date}`}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Delete button */}
                    {confirmDelete === patient.id ? (
                      <div className="absolute right-1 top-1 flex gap-1 rounded-lg p-1"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <button
                          onClick={() => { onDeletePatient(patient.id); setConfirmDelete(null) }}
                          style={{ fontSize: 10, color: 'var(--accent-rose)', padding: '2px 6px', borderRadius: 4, background: 'var(--accent-rose-dim)' }}
                        >
                          确认删除
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 4px' }}
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDelete(patient.id) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-smooth"
                        style={{ color: 'var(--text-muted)', padding: 3 }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4"
            style={{ borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              <span className="font-mono">OncoTrack v1.0</span>
              <br />数据同步至云端
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-smooth"
          style={{
            width: 24,
            height: 56,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            color: 'var(--text-muted)',
          }}
        >
          <ChevronRight size={14} />
        </button>
      )}
    </>
  )
}
