# SemanticOS

> **AI-powered Semantic SEO Intelligence Platform** built on the Koray Tugberk GUBUR (Koraynese) framework.  
> Generate topical maps, EAV architectures, content briefs, and authority audits — all powered by Gemini 2.5.

---

## ⚡ Deploy to Vercel (One Click)

### Step 1 — Push to GitHub
1. Create a new **private** GitHub repository (e.g. `semanticos`)
2. Run this from the `SemanticOS` folder:
```bash
git init
git add .
git commit -m "SemanticOS initial build"
git remote add origin https://github.com/YOUR_USERNAME/semanticos.git
git push -u origin main
```

### Step 2 — Connect to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel auto-detects **Vite** — no framework settings to change
4. Click **Deploy**

### Step 3 — Set Your API Key (Critical)
1. In your Vercel project, go to **Settings → Environment Variables**
2. Add:

| Name | Value |
|------|-------|
| `VITE_GEMINI_API_KEY` | `your_gemini_api_key_here` |

3. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
4. Re-deploy after saving the variable

---

## 🖥️ Local Development

Requires **Node.js 18+** installed on your machine.

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your API key
cp .env.example .env

# 3. Start dev server
npm run dev
```

App will be available at `http://localhost:5173`

---

## 🗺️ Module Overview

| # | Module | Description |
|---|--------|-------------|
| 01 | Domain Input | Set domain, business model, and geography |
| 02 | Source Context | Identify Central Entity & Search Intent |
| 03 | EAV Architecture | Map Entity → Attribute → Value chains |
| 04 | Topical Map | Generate Core + Outer section node maps |
| 05 | Content Briefs | Full Koraynese-compliant article briefs |
| 06 | Internal Links | Intent-progressive anchor linking matrix |
| 07 | Topical Audit | Coverage gaps, dilution, and 90-day plan |
| 08 | Growth Dashboard | Query gaps, trending nodes, content calendar |
| 09 | Competitor Analysis | Reverse-engineer competitor topical maps |
| 10 | SERP Entity Intel | Extract grounded entity gaps from live SERPs |
| 11 | Author E-E-A-T | Build Person schema and byline strategy |
| 12 | Multilingual Mode | Adapt topical maps per country/language |
| 13 | Semantic Distance | Score new topics for border risk |
| 14 | Programmatic SEO | Entity-variable URL and content blueprint |
| 15 | Sitemap Generator | Priority-weighted XML sitemap output |
| 16 | Export Suite | Download map, calendar, and audit as files |

---

## 🔑 Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Gemini 2.5 Flash** via `@google/genai`
- **Vercel** for hosting
- **LocalStorage** for zero-backend project persistence

---

## 📁 Project Structure

```
src/
├── App.tsx              ← Sidebar nav + page routing
├── index.css            ← Space Mono dark theme
├── types/index.ts       ← All TypeScript interfaces
├── hooks/useProject.ts  ← LocalStorage persistence hook
├── utils/
│   ├── gemini.ts        ← Gemini API wrapper
│   ├── prompts.ts       ← All Koraynese system prompts
│   └── theme.ts         ← Color system & inline styles
└── pages/               ← 16 module components
```
