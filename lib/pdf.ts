import { PatientProfile, MARKER_REFS } from './types'

export async function generatePDFReport(patient: PatientProfile, analysis: string): Promise<void> {
  // Dynamic import to avoid SSR issues
  const [{ default: jsPDF }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = margin

  // Color palette
  const colors = {
    navy: [16, 42, 67] as [number, number, number],
    teal: [56, 189, 248] as [number, number, number],
    light: [232, 240, 254] as [number, number, number],
    muted: [139, 168, 204] as [number, number, number],
    danger: [251, 113, 133] as [number, number, number],
    success: [52, 211, 153] as [number, number, number],
    warn: [251, 191, 36] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    bg: [10, 15, 26] as [number, number, number],
    gray: [240, 244, 248] as [number, number, number],
  }

  // Header background
  doc.setFillColor(...colors.navy)
  doc.rect(0, 0, pageW, 45, 'F')

  // Title
  doc.setTextColor(...colors.teal)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Cancer Treatment Report', margin, 22)

  doc.setTextColor(...colors.light)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Patient: ${patient.name}  |  Generated: ${new Date().toLocaleDateString('zh-CN')}`, margin, 32)

  if (patient.diagnosis) {
    doc.setFontSize(9)
    doc.setTextColor(...colors.muted)
    doc.text(`Diagnosis: ${patient.diagnosis}`, margin, 40)
  }

  y = 55

  // ─── Patient Info Box ───
  doc.setFillColor(...colors.gray)
  doc.roundedRect(margin, y, pageW - margin * 2, 32, 3, 3, 'F')
  doc.setFontSize(9)
  doc.setTextColor(...colors.navy)

  const infoItems = [
    ['Pathology', patient.pathology || 'N/A'],
    ['Genetics', patient.genetics || 'N/A'],
    ['First Diagnosis', patient.firstDiagnosisDate || 'N/A'],
    ['Total Records', String(patient.records.length)],
  ]

  infoItems.forEach((item, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + 8 + col * ((pageW - margin * 2) / 2)
    const iy = y + 10 + row * 14

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...colors.muted)
    doc.text(item[0], x, iy)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...colors.navy)
    const val = item[1].length > 50 ? item[1].slice(0, 50) + '...' : item[1]
    doc.text(val, x, iy + 6)
  })

  y += 42

  // ─── Tumor Markers Table ───
  const records = [...patient.records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Collect all marker names
  const markerNames = [...new Set(records.flatMap(r => r.markers.map(m => m.name)))]

  if (markerNames.length > 0 && records.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...colors.navy)
    doc.text('Tumor Markers History', margin, y)

    // Decorative line
    doc.setDrawColor(...colors.teal)
    doc.setLineWidth(0.5)
    doc.line(margin, y + 2, margin + 60, y + 2)
    y += 8

    const headers = ['Date', 'Treatment', ...markerNames]
    const rows = records.map(r => {
      const markerMap: Record<string, string> = {}
      r.markers.forEach(m => { markerMap[m.name] = String(m.value ?? '-') })
      return [
        r.date,
        r.treatment ? r.treatment.slice(0, 30) + (r.treatment.length > 30 ? '...' : '') : '-',
        ...markerNames.map(n => markerMap[n] ?? '-'),
      ]
    })

    ;(doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: y,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: colors.navy,
      },
      headStyles: {
        fillColor: colors.navy,
        textColor: colors.teal,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: colors.gray },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index >= 2) {
          const markerName = markerNames[data.column.index - 2]
          const val = parseFloat(data.cell.text[0])
          const ref = MARKER_REFS[markerName?.toUpperCase()]
          if (ref && !isNaN(val)) {
            if (val > ref.max * 3) {
              data.cell.styles.textColor = [220, 38, 38]
              data.cell.styles.fontStyle = 'bold'
            } else if (val > ref.max) {
              data.cell.styles.textColor = [217, 119, 6]
            } else {
              data.cell.styles.textColor = [5, 150, 105]
            }
          }
        }
      },
    })

    y = (doc as any).lastAutoTable.finalY + 12
  }

  // ─── Blood Test Table ───
  const bloodRecords = records.filter(r => r.blood && Object.values(r.blood).some(v => v !== null && v !== undefined))
  if (bloodRecords.length > 0) {
    if (y > pageH - 80) { doc.addPage(); y = margin }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...colors.navy)
    doc.text('Blood Test History', margin, y)
    doc.setDrawColor(...colors.success)
    doc.line(margin, y + 2, margin + 50, y + 2)
    y += 8

    const bloodHeaders = ['Date', 'WBC (×10⁹/L)', 'HGB (g/L)', 'PLT (×10⁹/L)', 'Creatinine', 'ALT', 'AST']
    const bloodRows = bloodRecords.map(r => [
      r.date,
      String(r.blood?.wbc ?? '-'),
      String(r.blood?.hgb ?? '-'),
      String(r.blood?.plt ?? '-'),
      String(r.blood?.creatinine ?? '-'),
      String(r.blood?.alt ?? '-'),
      String(r.blood?.ast ?? '-'),
    ])

    ;(doc as any).autoTable({
      head: [bloodHeaders],
      body: bloodRows,
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3, textColor: colors.navy },
      headStyles: { fillColor: colors.navy, textColor: [52, 211, 153], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: colors.gray },
    })

    y = (doc as any).lastAutoTable.finalY + 12
  }

  // ─── AI Analysis ───
  if (analysis) {
    if (y > pageH - 80) { doc.addPage(); y = margin }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...colors.navy)
    doc.text('AI Medical Analysis', margin, y)
    doc.setDrawColor(...colors.warn)
    doc.line(margin, y + 2, margin + 55, y + 2)
    y += 10

    // Strip markdown for PDF
    const cleanAnalysis = analysis
      .replace(/#{1,3}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/📊|💊|🩸|⚠️|📋|⚕️/g, '')
      .trim()

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(50, 50, 70)

    const lines = doc.splitTextToSize(cleanAnalysis, pageW - margin * 2)
    lines.forEach((line: string) => {
      if (y > pageH - 25) { doc.addPage(); y = margin }
      doc.text(line, margin, y)
      y += 5
    })
  }

  // ─── Footer on all pages ───
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(...colors.navy)
    doc.rect(0, pageH - 15, pageW, 15, 'F')
    doc.setTextColor(...colors.muted)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(
      '⚕️ This report is AI-generated for reference only. Always consult your physician.',
      margin,
      pageH - 7
    )
    doc.text(`Page ${i} / ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' })
  }

  doc.save(`${patient.name}_treatment_report_${new Date().toISOString().slice(0, 10)}.pdf`)
}
