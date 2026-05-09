export interface TumorMarker {
  name: string
  value: number | null
  unit?: string
  refMin?: number
  refMax?: number
}

export interface BloodTest {
  wbc?: number           // 白细胞 (×10⁹/L)
  hgb?: number           // 血红蛋白 (g/L)
  plt?: number           // 血小板 (×10⁹/L)
  neutrophil?: number    // 中性粒细胞
  creatinine?: number    // 血肌酐 Cr
  alt?: number           // 谷丙转氨酶 ALT
  ast?: number           // 谷草转氨酶 AST
  tbil?: number          // 总胆红素 TBIL
  pct?: number           // 降钙素原
  ldh?: number           // 乳酸脱氢酶 LDH
  ck?: number            // 肌酸激酶 CK
  ckMb?: number          // 肌酸激酶MB CK-MB
  tp?: number            // 总蛋白 TP
  alb?: number           // 白蛋白 ALB
  glb?: number           // 球蛋白 GLB
  dbil?: number          // 直接胆红素 DBIL
  tba?: number           // 总胆汁酸 TBA
  glu?: number           // 葡萄糖 GLU
  urea?: number          // 尿素 Urea
  hco3?: number          // 碳酸氢盐 HCO3
  ua?: number            // 尿酸 UA
  na?: number            // 钠 Na
  k?: number             // 钾 K
  cl?: number            // 氯 Cl
  ca?: number            // 钙 Ca
  p?: number             // 无机磷 P
  ggt?: number           // γ-谷氨酰转移酶 GGT
  alp?: number           // 碱性磷酸酶 ALP
  che?: number           // 胆碱酯酶 CHE
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
  diagnosis?: string        // 肿瘤范围/诊断
  pathology?: string        // 免疫组化
  genetics?: string         // 基因检测
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
  WBC:   { min: 3.5, max: 9.5, unit: '×10⁹/L' },
  HGB:   { min: 115, max: 150, unit: 'g/L' },
  PLT:   { min: 125, max: 350, unit: '×10⁹/L' },
}

// Keep generateId here for backward compat
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

export const BLOOD_LABELS: Record<string, string> = {
  wbc: 'WBC 白细胞',
  hgb: 'HGB 血红蛋白',
  plt: 'PLT 血小板',
  neutrophil: 'NEUT 中性粒细胞',
  creatinine: 'Cr 肌酐',
  alt: 'ALT 谷丙转氨酶',
  ast: 'AST 谷草转氨酶',
  tbil: 'TBIL 总胆红素',
  pct: 'PCT 降钙素原',
  ldh: 'LDH 乳酸脱氢酶',
  ck: 'CK 肌酸激酶',
  ckMb: 'CK-MB 肌酸激酶MB',
  tp: 'TP 总蛋白',
  alb: 'ALB 白蛋白',
  glb: 'GLB 球蛋白',
  dbil: 'DBIL 直接胆红素',
  tba: 'TBA 总胆汁酸',
  glu: 'GLU 葡萄糖',
  urea: 'Urea 尿素',
  hco3: 'HCO3 碳酸氢盐',
  ua: 'UA 尿酸',
  na: 'Na 钠',
  k: 'K 钾',
  cl: 'Cl 氯',
  ca: 'Ca 钙',
  p: 'P 无机磷',
  ggt: 'GGT γ-谷氨酰转移酶',
  alp: 'ALP 碱性磷酸酶',
  che: 'CHE 胆碱酯酶',
}
