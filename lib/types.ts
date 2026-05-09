export interface TumorMarker {
  name: string
  value: number | null
  unit?: string
  refMin?: number
  refMax?: number
}

// Dynamic - any lab test result can be stored here
export interface BloodTest {
  [key: string]: number | null | undefined
}

export interface TreatmentRecord {
  id: string
  date: string
  treatment?: string | null
  markers: TumorMarker[]
  blood?: BloodTest | null
  imaging?: string | null
  symptoms?: string | null
  notes?: string | null
}

export interface PatientProfile {
  id: string
  name: string
  diagnosis?: string
  pathology?: string
  genetics?: string
  firstDiagnosisDate?: string
  records: TreatmentRecord[]
  createdAt: string
  updatedAt: string
}

export interface AIAnalysis {
  summary: string
  markerTrends: string
  treatmentResponse: string
  recommendations: string
  flags: string[]
  confidence: 'high' | 'medium' | 'low'
}

export interface ChartDataPoint {
  date: string
  [key: string]: number | string | null | undefined
}

export type MarkerStatus = 'normal' | 'elevated' | 'critical' | 'unknown'

export const MARKER_REFS: Record<string, { min?: number; max: number; unit: string }> = {
  CEA:   { max: 4.7,  unit: 'ng/mL' },
  CA199: { max: 27,   unit: 'U/mL' },
  CA125: { max: 35,   unit: 'U/mL' },
  CA153: { max: 24,   unit: 'U/mL' },
  CA724: { max: 6.9,  unit: 'U/mL' },
  AFP:   { max: 9,    unit: 'ng/mL' },
  WBC:   { min: 3.5,  max: 9.5,  unit: '×10⁹/L' },
  HGB:   { min: 115,  max: 150,  unit: 'g/L' },
  PLT:   { min: 125,  max: 350,  unit: '×10⁹/L' },
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getMarkerStatus(name: string, value: number): MarkerStatus {
  const ref = MARKER_REFS[name.toUpperCase()]
  if (!ref) return 'unknown'
  if (value > ref.max * 3) return 'critical'
  if (value > ref.max) return 'elevated'
  if (ref.min && value < ref.min) return 'elevated'
  return 'normal'
}
