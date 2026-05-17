# 🩺 OncoTrack — 癌症治疗追踪仪表盘

> 为癌症患者和家属设计的 AI 智能治疗追踪工具，支持图片识别上传检验报告、动态趋势图、AI 医学分析、PDF 导出，数据云端同步。

**[🌐 在线演示 Live Demo](https://cancer-dashboard.vercel.app)**

![OncoTrack Screenshot](https://via.placeholder.com/900x500/f5f7fa/2563eb?text=OncoTrack+Cancer+Treatment+Dashboard)

---

## ✨ 功能特点 Features

| 功能 | 说明 |
|------|------|
| 📄 **AI 报告识别** | 拍照上传检验单，AI 自动提取所有指标数值 |
| 📈 **动态趋势图** | 肿瘤标志物、血常规历史趋势可视化，支持多指标对比 |
| 🤖 **AI 医学分析** | Grok AI 分析治疗效果，提供专业参考意见 |
| 💬 **AI 问诊助手** | 基于患者数据的 AI 问答 |
| 📑 **PDF 报告导出** | 一键生成完整治疗报告 |
| 🏥 **多患者管理** | 支持同时追踪多位患者 |
| ☁️ **云端同步** | 数据存储在 Supabase，家人可同时查看 |
| 📱 **手机友好** | 支持手机浏览器直接使用 |

---

## 🚀 快速部署 Quick Deploy

### 第一步：准备账号 Prepare Accounts

需要注册以下免费账号：

1. **GitHub** — https://github.com （存放代码）
2. **Vercel** — https://vercel.com （部署网站，免费）
3. **Supabase** — https://supabase.com （数据库，免费）
4. **xAI Grok API** — https://x.ai/api （AI 功能）

---

### 第二步：配置 Supabase 数据库

1. 登录 [Supabase](https://supabase.com)，点击 **New Project** 创建项目
2. 进入项目后，点击左侧 **SQL Editor**
3. 粘贴以下代码并点击 **Run**：

```sql
-- 患者表
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

-- 治疗记录表
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

-- 开放读写权限
alter table patients enable row level security;
alter table records enable row level security;

create policy "allow all" on patients for all using (true) with check (true);
create policy "allow all" on records for all using (true) with check (true);
```

4. 进入 **Settings → API Keys**，记录以下两个值：
   - **Project URL**（格式：`https://xxxxxx.supabase.co`）
   - **anon public** key（以 `eyJ` 开头的长字符串）

---

### 第三步：获取 Grok API Key

1. 打开 https://x.ai/api
2. 注册/登录，进入 **API Keys**
3. 创建一个新的 API Key，复制保存

---

### 第四步：部署到 Vercel

#### 方式A：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/liewmanhung/cancer-dashboard)

点击上方按钮，按提示操作，在 **Environment Variables** 步骤填入：

| 变量名 | 值 |
|--------|-----|
| `GROK_API_KEY` | 你的 Grok API Key |
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |

#### 方式B：手动部署

1. Fork 本仓库到你的 GitHub
2. 登录 [Vercel](https://vercel.com) → **New Project** → 导入你 Fork 的仓库
3. 在 **Environment Variables** 填入上面三个变量
4. 点击 **Deploy**

---

### 第五步：开始使用

部署完成后，Vercel 会给你一个网址（如 `https://your-app.vercel.app`），打开即可使用。

---

## 💻 本地开发 Local Development

```bash
# 1. 克隆仓库
git clone https://github.com/liewmanhung/cancer-dashboard.git
cd cancer-dashboard

# 2. 安装依赖（需要 Node.js 18+）
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API keys

# 4. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

### .env.local 配置

```env
GROK_API_KEY=你的Grok API Key
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
```

---

## 📖 使用说明 How to Use

### 添加患者
1. 点击左侧 **+** 按钮
2. 输入患者姓名
3. 在「患者信息」标签填写诊断、病理、基因检测等信息

### 上传检验报告
1. 点击「上传报告」标签
2. 拍照或选择检验单图片上传
3. AI 自动识别所有指标
4. 确认数据后点击「确认导入」

### 查看趋势图
- 点击「趋势图」标签
- 可选择显示哪些指标
- 支持面积图和折线图切换

### AI 分析
- 点击顶部「AI分析」按钮
- 等待 AI 生成完整的治疗效果分析报告
- 也可以在「AI分析」标签与 AI 对话提问

### 导出 PDF
- 点击顶部「导出PDF」按钮
- 在弹出的打印对话框中选择「另存为PDF」

---

## 🏗️ 技术栈 Tech Stack

- **框架**: Next.js 16
- **样式**: Tailwind CSS
- **图表**: Recharts
- **数据库**: Supabase (PostgreSQL)
- **AI**: xAI Grok API (Vision + Text)
- **部署**: Vercel

---

## ⚠️ 免责声明 Disclaimer

> 本工具由 AI 辅助生成分析报告，**仅供参考，不构成医疗建议**。所有医疗决策请以主治医师意见为准。
>
> This tool generates AI-assisted analysis for **reference only and does not constitute medical advice**. Always follow your physician's guidance for medical decisions.

---

## 🤝 贡献 Contributing

欢迎提交 Issue 和 Pull Request！如果这个工具对你有帮助，请给个 ⭐ Star，让更多患者能发现它。

If this tool helps you, please give it a ⭐ Star so more patients can find it!

---

## 📄 License

MIT © [liewmanhung](https://github.com/liewmanhung)
