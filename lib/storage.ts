import { PatientProfile, TreatmentRecord } from './types'
import { supabase } from './supabase'

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

export async function loadPatients(): Promise<PatientProfile[]> {
  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !patients) return []

  const result: PatientProfile[] = []

  for (const p of patients) {
    const { data: records } = await supabase
      .from('records')
      .select('*')
      .eq('patient_id', p.id)
      .order('date', { ascending: true })

    result.push({
      id: p.id,
      name: p.name,
      diagnosis: p.diagnosis,
      pathology: p.pathology,
      genetics: p.genetics,
      firstDiagnosisDate: p.first_diagnosis_date,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      records: (records || []).map(r => ({
        id: r.id,
        date: r.date,
        hospital: r.hospital,
        treatment: r.treatment,
        markers: r.markers || [],
        blood: r.blood,
        imaging: r.imaging,
        symptoms: r.symptoms,
        notes: r.notes,
      })),
    })
  }

  return result
}

export async function savePatient(patient: PatientProfile): Promise<void> {
  await supabase.from('patients').upsert({
    id: patient.id,
    name: patient.name,
    diagnosis: patient.diagnosis,
    pathology: patient.pathology,
    genetics: patient.genetics,
    first_diagnosis_date: patient.firstDiagnosisDate,
    updated_at: new Date().toISOString(),
  })
}

export async function saveRecord(record: TreatmentRecord, patientId: string): Promise<void> {
  await supabase.from('records').upsert({
    id: record.id,
    patient_id: patientId,
    date: record.date,
    hospital: record.hospital ?? null,
    treatment: record.treatment ?? null,
    markers: record.markers,
    blood: record.blood ?? null,
    imaging: record.imaging ?? null,
    symptoms: record.symptoms ?? null,
    notes: record.notes ?? null,
  })
}

export async function deleteRecordFromDb(id: string): Promise<void> {
  await supabase.from('records').delete().eq('id', id)
}

export async function deletePatientFromDb(id: string): Promise<void> {
  await supabase.from('patients').delete().eq('id', id)
}