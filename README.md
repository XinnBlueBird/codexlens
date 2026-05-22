<div align="center">

# CodexLens

**AI-powered code analysis engine. Paste code, get instant insights.**

[![Live](https://img.shields.io/badge/Live-codexlens.vercel.app-amber?style=flat-square)](https://codexlens.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![MiMo](https://img.shields.io/badge/AI-MiMo%20v2.5%20Pro-orange?style=flat-square)](https://mimo.xiaomi.com)

<br/>

![CodexLens Screenshot](https://codexlens.vercel.app/og.png)

</div>

---

## What it does

Paste any code snippet. CodexLens runs a structured AI analysis covering six dimensions:

- **Language & Complexity** — cyclomatic complexity, maintainability index, cognitive load
- **Security Audit** — injection vectors, XSS, hardcoded secrets, unsafe patterns (severity-rated)
- **Performance Review** — bottlenecks, unnecessary allocations, O(n) issues, blocking calls
- **Best Practices** — idioms, naming conventions, error handling, type safety
- **Refactoring Suggestions** — concrete before/after code snippets
- **Overall Score** — 1-100 rating with one-line summary

Results stream in real-time via SSE (Server-Sent Events) on Vercel Edge Runtime.

## Supported languages

JavaScript · TypeScript · Python · Rust · Go · Java · C++ · Solidity

Language is auto-detected from the code. No manual selection needed.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5 |
| AI Engine | MiMo v2.5 Pro (Xiaomi) |
| Runtime | Vercel Edge (SSE streaming) |
| Fonts | Inter + JetBrains Mono |
| Icons | Lucide React |

## Getting started

```bash
# Clone
git clone https://github.com/XinnBlueBird/codexlens.git
cd codexlens

# Install
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your MiMo API key

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MIMO_API_KEY` | MiMo API key (required) | — |
| `MIMO_API_BASE` | MiMo API endpoint | `https://token-plan-sgp.xiaomimimo.com/v1` |
| `MIMO_MODEL` | Model identifier | `mimo-v2.5-pro` |

Get your API key at [mimo.xiaomi.com](https://mimo.xiaomi.com).

## Architecture

```
codexlens/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Main UI — code input + analysis output
│   └── api/
│       └── analyze/
│           └── route.ts    # Edge API route — SSE streaming proxy to MiMo
├── public/
│   └── favicon.svg
├── .env.example
├── package.json
└── README.md
```

The `/api/analyze` route runs on Edge Runtime for token-by-token streaming. It proxies the code to MiMo v2.5 Pro, parses the SSE response (handling both `content` and `reasoning_content` fields), and streams it back to the client.

## License

MIT
