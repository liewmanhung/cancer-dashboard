'use client'

import { useState, useEffect } from 'react'
import { PatientProfile } from '@/lib/types'
import {
  loadPatients, savePatient, deletePatientFromDb,
  createNewPatient
} from '@/lib/storage'
import Sidebar from '@/components/Sidebar'
import PatientDashboard from '@/components/PatientDashboard'
import WelcomeScreen from '@/components/WelcomeScreen'

export default function Home() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [activePatientId, setActivePatientId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    loadPatients().then(loaded => {
      setPatients(loaded)
      if (loaded.length > 0) setActivePatientId(loaded[0].id)
      setMounted(true)
    })
  }, [])

  const activePatient = patients.find(p => p.id === activePatientId) || null

  const handleAddPatient = async (name: string) => {
    const patient = createNewPatient(name)
    await savePatient(patient)
    setPatients(prev => [...prev, patient])
    setActivePatientId(patient.id)
  }

  const handleUpdatePatient = async (updated: PatientProfile) => {
    await savePatient(updated)
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  const handleDeletePatient = async (id: string) => {
    await deletePatientFromDb(id)
    const remaining = patients.filter(p => p.id !== id)
    setPatients(remaining)
    if (activePatientId === id) {
      setActivePatientId(remaining[0]?.id || null)
    }
  }

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Loading data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar
        patients={patients}
        activePatientId={activePatientId}
        onSelectPatient={setActivePatientId}
        onAddPatient={handleAddPatient}
        onDeletePatient={handleDeletePatient}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ marginLeft: 0 }}>
        {activePatient ? (
          <PatientDashboard
            patient={activePatient}
            onUpdate={handleUpdatePatient}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        ) : (
          <WelcomeScreen onAddPatient={handleAddPatient} />
        )}
      </main>
    </div>
  )
}