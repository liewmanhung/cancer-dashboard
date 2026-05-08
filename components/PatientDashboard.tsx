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

  const handleSaveRecord = (record: TreatmentRecord) => {
    const exists = patient.records.find(r => r.id === record.id)
    const updated = exists
      ? patient.records.map(r => r.id === record.id ? record : r)
      : [...patient.records, record]
    onUpdate({ ...patient, records: updated, updatedAt: new Date().toISOString() })
    setAddingRecord(false)
    setEditingRecord(null)
  }

  const handleDeleteRecord = (id: string) => {
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
      await generatePDFReport(patient, aiAnalysis)
    } catch (e) {
      console.error('PDF error:', e)
      alert('PDF生成失败：' + String(e))
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
            手动录入
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
            AI分析
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
            导出PDF
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
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)', padding: 20 }}>
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
