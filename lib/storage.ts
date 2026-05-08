import { PatientProfile, TreatmentRecord } from './types'

const STORAGE_KEY = 'cancer_dashboard_patients'

export function loadPatients(): PatientProfile[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePatients(patients: PatientProfile[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
}

export function savePatient(patient: PatientProfile): void {
  const patients = loadPatients()
  const idx = patients.findIndex(p => p.id === patient.id)
  if (idx >= 0) {
    patients[idx] = { ...patient, updatedAt: new Date().toISOString() }
  } else {
    patients.push(patient)
  }
  savePatients(patients)
}

export function deletePatient(id: string): void {
  const patients = loadPatients().filter(p => p.id !== id)
  savePatients(patients)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createNewPatient(name: string): PatientProfile {
  return {
    id: generateId(),
    name,
    records: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function sortRecords(records: TreatmentRecord[]): TreatmentRecord[] {
  return [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
