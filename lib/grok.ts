import { PatientProfile, TreatmentRecord } from './types'

interface GrokMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | GrokContent[]
}

interface GrokContent {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string; detail?: string }
}

export async function callGrok(messages: GrokMessage[], model?: string): Promise<string> {
  const res = await fetch('/api/grok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.choices?.[0]?.message?.content || ''
}

export async function analyzeReportImage(imageBase64: string, mimeType: string): Promise<Partial<TreatmentRecord>> {
  const prompt = `你是专业医疗OCR助手。仔细分析这张检验报告，提取所有数据。

分类规则：
- markers（仅限肿瘤标志物）：CEA、AFP、CA199、CA125、CA153、CA724、CA211、NSE、SCC、PSA、HCG等，如果报告中没有这些指标则markers为空数组
- blood（生化/血常规/其他所有指标）：肝功能、肾功能、电解质、血糖、血脂、血常规、酶学等全部放这里，用英文缩写作为key

必须提取报告中每一行，不能遗漏。只返回JSON：
{
  "date": "YYYY-MM-DD或null",
  "treatment": null,
  "markers": [],
  "blood": {
    "wbc": null, "hgb": null, "plt": null, "neutrophil": null,
    "creatinine": null, "alt": null, "ast": null, "tbil": null,
    "ldh": null, "ck": null, "ckMb": null, "tp": null, "alb": null,
    "glb": null, "dbil": null, "tba": null, "glu": null, "urea": null,
    "hco3": null, "ua": null, "na": null, "k": null, "cl": null,
    "ca": null, "p": null, "ggt": null, "alp": null, "che": null
  },
  "imaging": null,
  "symptoms": null,
  "notes": null
}`

  const messages: GrokMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        { type: 'text', text: prompt }
      ]
    }
  ]

  const raw = await callGrok(messages, 'grok-4.3')
  const clean = raw.replace(/```json\n?|\n?```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    const match = clean.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('AI返回格式错误: ' + raw.slice(0, 200))
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

  return callGrok(messages, 'grok-4-1-fast-reasoning')
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

  return callGrok(messages, 'grok-4-1-fast-reasoning')
}
