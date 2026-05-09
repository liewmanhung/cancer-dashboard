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
  const prompt = `你是专业医疗OCR助手。仔细分析这张检验报告图片，提取所有数据。

规则：
1. markers数组：只放肿瘤标志物（CEA、AFP、CA199、CA125、CA153、CA724、NSE、PSA等），没有则为空数组
2. blood对象：报告中所有其他检验指标，key用"英文缩写中文名"格式（如"ALT谷丙转氨酶"），value为数字
3. 必须提取报告中每一行指标，一个不能漏，按序号顺序检查
4. 只返回JSON，不要任何解释或markdown
5. hospital：提取报告抬头的医院名称

返回格式示例：
{
  "date": "2026-05-07",
"hospital": "医院名称或null",  
"treatment": null,
  "markers": [
    {"name": "CEA", "value": 12.3}
  ],
  "blood": {
    "LDH乳酸脱氢酶": 284,
    "CK肌酸激酶": 58,
    "CKMB肌酸激酶MB同工酶": 33.8,
    "TP总蛋白": 66.2,
    "ALB白蛋白": 32.4,
    "GLB球蛋白": 33.8,
    "AG白蛋白球蛋白比值": 1.0,
    "TBIL总胆红素": 8.7,
    "DBIL直接胆红素": 1.9,
    "TBA总胆汁酸": 11,
    "GLU葡萄糖": 7.14,
    "Urea尿素": 7.8,
    "HCO3碳酸氢盐": 23.9,
    "UA尿酸": 261,
    "Cr肌酐": 68.82,
    "Na钠": 142,
    "K钾": 4,
    "Cl氯": 105.1,
    "Ca钙": 2.24,
    "CA校正校正血清钙": 2.39,
    "P无机磷": 1.14,
    "ALT谷丙转氨酶": 14,
    "GGT谷氨酰转移酶": 15,
    "ALP碱性磷酸酶": 86,
    "CHE胆碱酯酶": 7308,
    "AST谷草转氨酶": 28
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
      ? Object.entries(r.blood)
          .filter(([, v]) => v != null)
          .map(([k, v]) => `${k}:${v}`)
          .join(' ')
      : ''
    return `[${r.date}] 治疗: ${r.treatment || '无'} | 标志物: ${markerStr} | 检验: ${bloodStr}${r.symptoms ? ' | 症状: ' + r.symptoms : ''}`
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
*⚕️ 免责声明：以上分析由AI生成，仅供参考，不构成医疗建议。请以主治医师意见为准。*`,
    },
    {
      role: 'user',
      content: `患者：${patient.name}
诊断：${patient.diagnosis || '未记录'}
病理：${patient.pathology || '未记录'}
基因：${patient.genetics || '未记录'}

治疗记录（按时间排序）：
${summary}

请提供详细的医学分析。`,
    },
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
    { role: 'user', content: userMessage },
  ]

  return callGrok(messages, 'grok-4-1-fast-reasoning')
}
