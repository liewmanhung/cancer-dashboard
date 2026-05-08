'use client'

import { useState } from 'react'
import { PatientProfile, TreatmentRecord } from '@/lib/types'
import { sortRecords, generateId } from '@/lib/storage'
import { generatePDFReport } from '@/lib/pdf'
import { generatePatientAnalysis } from '@/lib/grok'
import OverviewCards from './OverviewCards'
import MarkerCharts from './MarkerCharts'
import RecordTable from './RecordTable'
import UploadReport from './UploadReport'
import AIAnalysisPanel from './AIAnalysisPanel'
import RecordModal from './RecordModal'
import PatientInfo from './PatientInfo'
import {
  Menu, FilePlus, FileDown, Brain, ChevronRight,
  LayoutDashboard, TrendingUp, Table, Upload, Stethoscope, Info,
} from 'lucide-react'

type Tab = 'overview' | 'charts' | 'records' | 'upload' | 'ai' | 'info'

interface Props {
  patient: PatientProfile
  onUpdate: (p: PatientProfile) => void
  onToggleSidebar: () => void
}

export default function PatientDashboard({ patient, onUpdate, onToggleSidebar }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [addingRecord, setAddingRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TreatmentRecord | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const records = sortRecords(patient.records)

  const handleSaveRecord = async (record: TreatmentRecord) => {
    const { saveRecord } = await import('@/lib/storage')
    await saveRecord(record, patient.id)
    const exists = patient.records.find(r => r.id === record.id)
    const updated = exists
      ? patient.records.map(r => r.id === record.id ? record : r)
      : [...patient.records, record]
    onUpdate({ ...patient, records: updated, updatedAt: new Date().toISOString() })
    setAddingRecord(false)
    setEditingRecord(null)
  }

  const handleDeleteRecord = async (id: string) => {
    const { deleteRecordFromDb } = await import('@/lib/storage')
    await deleteRecordFromDb(id)
    onUpdate({ ...patient, records: patient.records.filter(r => r.id !== id) })
  }

  const handleUploadedRecord = (partial: Partial<TreatmentRecord>) => {
    const record: TreatmentRecord = {
      id: generateId(),
      date: partial.date || new Date().toISOString().slice(0, 10),
      markers: partial.markers || [],
      blood: partial.blood,
      treatment: partial.treatment,
      imaging: partial.imaging,
      symptoms: partial.symptoms,
      notes: partial.notes,
    }
    handleSaveRecord(record)
    setTab('records')
  }

  const handleGenerateAI = async () => {
    setAiLoading(true)
    setTab('ai')
    try {
      const analysis = await generatePatientAnalysis(patient)
      setAiAnalysis(analysis)
    } catch (e) {
      setAiAnalysis('❌ AI分析失败，请检查API密钥配置。\n\n错误: ' + String(e))
    } finally {
      setAiLoading(false)
    }
  }

  const handleExportPDF = async () => {
    setPdfLoading(true)
    try {
      const sortedRecords = [...patient.records].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      const allMarkers = [...new Set(sortedRecords.flatMap(r => r.markers.map(m => m.name)))]

      const tableRows = sortedRecords.map(r => {
        const markerMap: Record<string, string> = {}
        r.markers.forEach(m => { markerMap[m.name] = String(m.value ?? '-') })
        return `<tr>
          <td>${r.date}</td>
          <td>${r.treatment || '-'}</td>
          ${allMarkers.map(n => `<td>${markerMap[n] ?? '-'}</td>`).join('')}
          <td>${r.blood?.wbc ?? '-'}</td>
          <td>${r.blood?.hgb ?? '-'}</td>
          <td>${r.blood?.plt ?? '-'}</td>
          <td>${r.symptoms || '-'}</td>
        </tr>`
      }).join('')

      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${patient.name} 抗癌治疗报告</title>
<style>
  body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 30px; color: #1a1a2e; }
  h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px; }
  h2 { color: #334e68; margin-top: 24px; font-size: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  th { background: #102a43; color: #38bdf8; padding: 8px; text-align: left; }
  td { padding: 7px 8px; border-bottom: 1px solid #e0e0e0; }
  tr:nth-child(even) td { background: #f5f9ff; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
  .info-box { background: #f0f4f8; border-radius: 8px; padding: 12px; }
  .info-label { font-size: 11px; color: #627d98; text-transform: uppercase; margin-bottom: 4px; }
  .info-value { font-size: 13px; color: #102a43; font-weight: 600; }
  .analysis { background: #f8fafc; border-left: 4px solid #0284c7; padding: 16px; margin-top: 12px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; }
  .disclaimer { margin-top: 24px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
  @media print { body { padding: 15px; } }
</style>
</head>
<body>
<h1>🩺 抗癌治疗追踪报告</h1>

<div class="info-grid">
  <div class="info-box"><div class="info-label">患者姓名</div><div class="info-value">${patient.name}</div></div>
  <div class="info-box"><div class="info-label">生成日期</div><div class="info-value">${new Date().toLocaleDateString('zh-CN')}</div></div>
  <div class="info-box"><div class="info-label">诊断</div><div class="info-value">${patient.diagnosis || '未记录'}</div></div>
  <div class="info-box"><div class="info-label">基因检测</div><div class="info-value">${patient.genetics || '未记录'}</div></div>
  <div class="info-box" style="grid-column:span 2"><div class="info-label">免疫组化</div><div class="info-value">${patient.pathology || '未记录'}</div></div>
</div>

<h2>📊 治疗记录历史</h2>
<table>
  <thead><tr>
    <th>日期</th><th>治疗方案</th>
    ${allMarkers.map(m => `<th>${m}</th>`).join('')}
    <th>WBC</th><th>HGB</th><th>PLT</th><th>症状</th>
  </tr></thead>
  <tbody>${tableRows}</tbody>
</table>

${aiAnalysis ? `<h2>🤖 AI 医学分析</h2><div class="analysis">${aiAnalysis.replace(/#{1,3}\s*/g, '').replace(/\*\*(.*?)\*\*/g, '$1')}</div>` : ''}

<div class="disclaimer">⚕️ 免责声明：本报告由 AI 辅助生成，仅供参考，不构成医疗建议。请以主治医师意见为准。</div>
</body>
</html>`

      const win = window.open('', '_blank')!
      win.document.write(html)
      win.document.close()
      setTimeout(() => win.print(), 500)
    } finally {
      setPdfLoading(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '概览', icon: <LayoutDashboard size={15} /> },
    { id: 'charts', label: '趋势图', icon: <TrendingUp size={15} /> },
    { id: 'records', label: '记录', icon: <Table size={15} /> },
    { id: 'upload', label: '上传报告', icon: <Upload size={15} /> },
    { id: 'ai', label: 'AI分析', icon: <Brain size={15} /> },
    { id: 'info', label: '患者信息', icon: <Info size={15} /> },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Top nav */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 56,
        flexShrink: 0,
      }}>
        <button onClick={onToggleSidebar} style={{ color: 'var(--text-muted)', padding: 4 }}>
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>OncoTrack</span>
          <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>
            {patient.name}
          </span>
          <span style={{
            marginLeft: 4,
            fontSize: 11,
            padding: '1px 8px',
            borderRadius: 999,
            background: 'var(--accent-teal-dim)',
            color: 'var(--accent-teal)',
            border: '1px solid rgba(56,189,248,0.15)',
            fontFamily: 'var(--font-mono)',
          }}>
            {records.length} records
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setAddingRecord(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'var(--text-secondary)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <FilePlus size={14} />
            <span className="hidden sm:inline">手动录入</span>
          </button>

          <button
            onClick={handleGenerateAI}
            disabled={aiLoading || records.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: aiLoading ? 'var(--bg-card)' : 'var(--accent-violet-dim)',
              border: '1px solid rgba(167,139,250,0.2)',
              borderRadius: 8,
              padding: '6px 12px',
              color: aiLoading ? 'var(--text-muted)' : 'var(--accent-violet)',
              fontSize: 12,
              cursor: aiLoading || records.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              opacity: records.length === 0 ? 0.5 : 1,
            }}
          >
            {aiLoading ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Brain size={14} />}
            <span className="hidden sm:inline">AI分析</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={pdfLoading || records.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: pdfLoading ? 'var(--bg-card)' : 'var(--accent-amber-dim)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 8,
              padding: '6px 12px',
              color: pdfLoading ? 'var(--text-muted)' : 'var(--accent-amber)',
              fontSize: 12,
              cursor: pdfLoading || records.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)',
              opacity: records.length === 0 ? 0.5 : 1,
            }}
          >
            {pdfLoading ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <FileDown size={14} />}
            <span className="hidden sm:inline">导出PDF</span>
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: 2,
        padding: '8px 20px 0',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              fontWeight: tab === t.id ? 600 : 400,
              background: tab === t.id ? 'var(--bg-primary)' : 'transparent',
              color: tab === t.id ? 'var(--accent-teal)' : 'var(--text-muted)',
              borderTop: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
              borderLeft: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
              borderRight: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
              marginBottom: tab === t.id ? -1 : 0,
              transition: 'all 0.15s ease',
            }}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)', padding: 20 }} id="dashboard-content">
        {tab === 'overview' && (
          <OverviewCards
            patient={patient}
            records={records}
            onEdit={r => { setEditingRecord(r); }}
          />
        )}
        {tab === 'charts' && <MarkerCharts records={records} />}
        {tab === 'records' && (
          <RecordTable
            records={records}
            onEdit={r => setEditingRecord(r)}
            onDelete={handleDeleteRecord}
            onAdd={() => setAddingRecord(true)}
          />
        )}
        {tab === 'upload' && (
          <UploadReport onRecordExtracted={handleUploadedRecord} />
        )}
        {tab === 'ai' && (
          <AIAnalysisPanel
            analysis={aiAnalysis}
            loading={aiLoading}
            patient={patient}
            onRegenerate={handleGenerateAI}
          />
        )}
        {tab === 'info' && (
          <PatientInfo patient={patient} onUpdate={onUpdate} />
        )}
      </div>

      {/* Record modal */}
      {(addingRecord || editingRecord) && (
        <RecordModal
          record={editingRecord}
          onSave={handleSaveRecord}
          onClose={() => { setAddingRecord(false); setEditingRecord(null) }}
        />
      )}
    </div>
  )
}
