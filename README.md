# 🩺 OncoTrack — Cancer Treatment Dashboard

> An AI-powered cancer treatment tracking dashboard for patients and caregivers. Upload medical report photos, track tumor markers over time, get AI medical insights, and share data with family — all in one place.

**[中文说明](#中文说明)**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **AI Report Scanning** | Take a photo of any lab report — AI automatically extracts all test values |
| 📈 **Trend Charts** | Interactive charts for tumor markers and blood tests over time |
| 🤖 **AI Medical Analysis** | Grok AI analyzes treatment history and provides professional insights |
| 💬 **AI Chat Assistant** | Ask questions about your data in natural language |
| 📑 **PDF Export** | Generate a complete treatment report with one click |
| 🏥 **Multi-patient** | Track multiple patients with separate profiles |
| ☁️ **Cloud Sync** | Data stored in Supabase — accessible by the whole family |
| 📱 **Mobile Friendly** | Works on phones and tablets |

---

## 🚀 Deploy Your Own (Free)

You'll need free accounts on:
- **GitHub** — https://github.com
- **Vercel** — https://vercel.com (hosting)
- **Supabase** — https://supabase.com (database)
- **xAI** — https://x.ai/api (Grok AI)

### Step 1: Set up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
create table patients (
  id text primary key,
  name text not null,
  diagnosis text,
  pathology text,
  genetics text,
  first_diagnosis_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table records (
  id text primary key,
  patient_id text references patients(id) on delete cascade,
  date text not null,
  hospital text,
  treatment text,
  markers jsonb default '[]',
  blood jsonb,
  imaging text,
  symptoms text,
  notes text,
  created_at timestamptz default now()
);

alter table patients enable row level security;
alter table records enable row level security;
create policy "allow all" on patients for all using (true) with check (true);
create policy "allow all" on records for all using (true) with check (true);
```

3. Go to **Settings → API Keys** and save your:
   - **Project URL** (e.g. `https://xxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 2: Get a Grok API Key

1. Go to https://x.ai/api
2. Sign up and create an API key

### Step 3: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/liewmanhung/cancer-dashboard)

Click the button above and set these environment variables:

| Variable | Value |
|----------|-------|
| `GROK_API_KEY` | Your Grok API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `APP_PASSWORD` | A password to protect your dashboard (optional) |

### Step 4: Start Using

Vercel will give you a URL like `https://your-app.vercel.app`. Open it and start adding patients!

---

## 💻 Local Development

```bash
# Clone the repo
git clone https://github.com/liewmanhung/cancer-dashboard.git
cd cancer-dashboard

# Install dependencies (requires Node.js 18+)
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
# Open http://localhost:3000
```

**.env.local example:**
```env
GROK_API_KEY=your_grok_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
APP_PASSWORD=your_optional_password
```

---

## 🏗️ Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **AI**: xAI Grok API (Vision + Text)
- **Deployment**: Vercel

---

## ⚠️ Medical Disclaimer

This tool generates AI-assisted analysis for **reference only and does not constitute medical advice**. Always follow your physician's guidance for all medical decisions.

---

## 🤝 Contributing

Issues and Pull Requests are welcome! If this tool helps you or someone you love, please give it a ⭐ **Star** — it helps more patients find this project.

---

## 中文说明

### 功能介绍

OncoTrack 是一个为癌症患者和家属设计的智能治疗追踪工具：

- **上传检验报告**：拍照上传检验单，AI 自动识别所有指标
- **趋势图**：肿瘤标志物、血常规历史趋势可视化
- **AI 分析**：Grok AI 分析治疗效果，提供参考意见
- **云端同步**：家人可同时查看同一份数据
- **PDF 导出**：一键生成完整治疗报告

### 部署步骤

1. 注册 [Supabase](https://supabase.com) 创建数据库，运行上方 SQL 建表
2. 在 [Supabase Settings → API Keys](https://supabase.com) 获取 URL 和 anon key
3. 注册 [xAI](https://x.ai/api) 获取 Grok API key
4. 点击上方 **Deploy with Vercel** 按钮，填入三个环境变量即可

### 免责声明

本工具由 AI 辅助生成分析报告，**仅供参考，不构成医疗建议**。所有医疗决策请以主治医师意见为准。

---

## 📄 License

MIT © [liewmanhung](https://github.com/liewmanhung)
