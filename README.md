# 🩺 OncoTrack — Cancer Treatment Dashboard

> AI-powered cancer treatment tracking and analysis dashboard built with Next.js, Grok AI Vision, and Vercel.

![Dashboard Preview](https://via.placeholder.com/800x400/0a0f1a/38bdf8?text=OncoTrack+Dashboard)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **AI Report Scanning** | Upload photos of medical reports — Grok Vision AI extracts tumor markers, blood tests, imaging findings automatically |
| 📈 **Dynamic Charts** | Interactive trend charts for tumor markers (CEA, CA199, CA125...) and blood counts |
| 🤖 **AI Medical Analysis** | Grok AI analyzes treatment history and provides professional insights |
| 💬 **AI Chat** | Ask questions about your data, get AI-powered answers |
| 📑 **PDF Export** | Generate comprehensive PDF reports with charts and AI analysis |
| 🏥 **Multi-patient** | Track multiple patients with separate profiles |
| 💾 **Local Storage** | All data stored in browser localStorage — completely private |
| ⚠️ **Abnormal Flags** | Automatic highlighting of out-of-range values |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/cancer-dashboard.git
cd cancer-dashboard
npm install
```

### 2. Configure API Key

```bash
cp .env.example .env.local
# Edit .env.local and add your Grok API key:
# GROK_API_KEY=your_key_here
```

Get your Grok API key at: https://x.ai/api

### 3. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

## 🌐 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, then add environment variable:
vercel env add GROK_API_KEY
```

### Option B: GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variable `GROK_API_KEY` in project settings
4. Deploy!

```
Project Settings → Environment Variables → Add:
  Name:  GROK_API_KEY
  Value: your_grok_api_key_here
```

## 📂 Project Structure

```
cancer-dashboard/
├── app/
│   ├── api/grok/route.ts    # Grok API proxy endpoint
│   ├── globals.css          # Global styles & design system
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── Sidebar.tsx          # Patient list sidebar
│   ├── PatientDashboard.tsx # Main dashboard container
│   ├── OverviewCards.tsx    # Summary cards & latest record
│   ├── MarkerCharts.tsx     # Recharts trend visualizations
│   ├── RecordTable.tsx      # Historical data table
│   ├── UploadReport.tsx     # Image upload + AI extraction
│   ├── AIAnalysisPanel.tsx  # AI analysis + chat interface
│   ├── RecordModal.tsx      # Manual record entry form
│   ├── PatientInfo.tsx      # Patient profile editor
│   └── WelcomeScreen.tsx    # Onboarding screen
├── lib/
│   ├── types.ts             # TypeScript interfaces
│   ├── storage.ts           # localStorage utilities
│   ├── grok.ts              # Grok AI client
│   └── pdf.ts               # PDF generation
├── .env.example
├── vercel.json
└── tailwind.config.js
```

## 🔑 Supported Medical Metrics

### Tumor Markers
- CEA (癌胚抗原) — Normal: ≤4.7 ng/mL
- CA199 — Normal: ≤27 U/mL
- CA125 — Normal: ≤35 U/mL
- CA153 — Normal: ≤24 U/mL
- CA724 — Normal: ≤6.9 U/mL
- AFP — Normal: ≤9 ng/mL
- Custom markers (user-defined)

### Blood Tests
- WBC (白细胞) — Normal: 3.5–9.5 ×10⁹/L
- HGB (血红蛋白) — Normal: 115–150 g/L
- PLT (血小板) — Normal: 125–350 ×10⁹/L
- Neutrophil (中性粒细胞)
- Creatinine (血肌酐)
- ALT/AST (肝功能)
- TBIL (总胆红素)

## 🤖 Grok API Models Used

| Feature | Model |
|---------|-------|
| Report image scanning | `grok-2-vision-1212` |
| Medical analysis | `grok-2-1212` |
| AI chat assistant | `grok-2-1212` |

## ⚠️ Medical Disclaimer

> This tool is for **reference only** and does not constitute medical advice. All AI-generated analysis must be reviewed by qualified medical professionals. Always follow your physician's guidance.

## 🔒 Privacy

All patient data is stored **exclusively in your browser's localStorage**. No data is sent to any server except when calling the Grok API for AI analysis. API calls go through the `/api/grok` proxy which keeps your API key server-side secure.

## 📝 License

MIT
