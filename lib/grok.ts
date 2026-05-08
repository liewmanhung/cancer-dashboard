import { PatientProfile, TreatmentRecord } from './types'

interface GrokMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | GrokContent[]
}

interface GrokContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

export async function callGrok(messages: GrokMessage[], model?: string): Promise<string> {
  const res = await fetch('/api/grok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function analyzeReportImage(imageBase64: string, mimeType: string): Promise<Partial<TreatmentRecord>> {
  const messages: GrokMessage[] = [
    {
      role: 'system',
      content: `You are a medical AI assistant analyzing cancer treatment reports. 
Extract structured data from medical reports including tumor markers, blood tests, imaging findings, and treatments.
Always respond with valid JSON only, no markdown, no explanation.
JSON schema:
{
  "date": "YYYY-MM-DD or null",
  "treatment": "treatment description or null",
  "markers": [{"name": "CEA|CA199|CA125|CA153|CA724|AFP", "value": number}],
  "blood": {
    "wbc": number or null,
    "hgb": number or null,
    "plt": number or null,
    "neutrophil": number or null,
    "creatinine": number or null,
    "alt": number or null,
    "ast": number or null,
    "tbil": number or null
  },
  "imaging": "imaging findings summary or null",
  "symptoms": "symptoms/side effects or null",
  "notes": "other notes or null"
}`
    },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${imageBase64}` }
        },
        {
          type: 'text',
          text: 'Extract all medical data from this report image. Return JSON only.'
        }
      ]
    }
  ]

  const raw = await callGrok(messages, 'grok-2-vision-1212')
  try {
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}

export async function generatePatientAnalysis(patient: PatientProfile): Promise<string> {
  const records = [...patient.records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const summary = records.map(r => {
    const markerStr = r.markers.map(m => `${m.name}: ${m.value}`).join(', ')
    const bloodStr = r.blood
      ? `WBC:${r.blood.wbc ?? '-'} HGB:${r.blood.hgb ?? '-'} PLT:${r.blood.plt ?? '-'}`
      : ''
    return `[${r.date}] 治疗: ${r.treatment || '无'} | 标志物: ${markerStr} | 血常规: ${bloodStr}${r.symptoms ? ' | 症状: ' + r.symptoms : ''}`
  }).join('\n')

  const messages: GrokMessage[] = [
    {
      role: 'system',
      content: `你是一名专业的肿瘤科医疗AI助手。请用中文分析患者的癌症治疗记录，提供专业但易于理解的医学评估。
注意：你的分析仅供参考，不能替代专业医师诊断。请明确标注这一点。
请按以下结构输出（使用Markdown）：

## 📊 总体趋势评估
（分析肿瘤标志物的整体趋势，是上升、下降还是稳定）

## 💊 治疗反应分析  
（根据标志物变化评估治疗效果）

## 🩸 血液学指标
（评估血常规指标，关注骨髓抑制等副反应）

## ⚠️ 需要关注的指标
（列出异常或需要监测的指标）

## 📋 建议
（基于数据的一般性建议，必须注明需遵循主治医师指导）

---
*⚕️ 免责声明：以上分析由AI生成，仅供参考，不构成医疗建议。请以主治医师意见为准。*`
    },
    {
      role: 'user',
      content: `患者：${patient.name}
诊断：${patient.diagnosis || '未记录'}
病理：${patient.pathology || '未记录'}
基因：${patient.genetics || '未记录'}

治疗记录（按时间排序）：
${summary}

请提供详细的医学分析。`
    }
  ]

  return callGrok(messages, 'grok-2-1212')
}

export async function chatWithAI(
  userMessage: string,
  patient: PatientProfile,
  history: Array<{ role: string; content: string }>
): Promise<string> {
  const recentRecords = [...patient.records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(r => `[${r.date}] ${r.markers.map(m => `${m.name}:${m.value}`).join(' ')}`)
    .join('\n')

  const systemMsg = `你是专业肿瘤科AI助手，正在帮助分析患者${patient.name}的治疗数据。
患者诊断：${patient.diagnosis || '未知'}
最近5次记录：
${recentRecords}
请用中文回答，回答要专业、清晰，并始终提醒患者以主治医师意见为准。`

  const messages: GrokMessage[] = [
    { role: 'system', content: systemMsg },
    ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user', content: userMessage }
  ]

  return callGrok(messages, 'grok-2-1212')
}
