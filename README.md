# VIGIL-AI Cameroun — Frontend

The web dashboard for VIGIL-AI Cameroun, connecting to the FastAPI backend to give analysts,
administrators, and viewers a working tool for investigating AI-generated content threats.

Built for the 5th Digital Innovation Week 2026, MINPOSTEL Cameroun.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-native `@theme` token system) |
| Routing | React Router 7 |
| HTTP client | Axios (with automatic JWT refresh-on-401) |
| Charts | Recharts |
| Icons | Lucide |
| Real-time | Native WebSocket (auto-reconnecting) |
| Testing | Vitest + React Testing Library |
| Linting | oxlint |

No paid services. The only external network calls are to your own backend and to Google Fonts
(IBM Plex Sans/Mono) — everything else is self-contained.

---

## Design

This isn't a generic admin-template skin. A few intentional choices:

- **Signature element — the "cachet" stamp.** Every AI-detection verdict (Safe / Suspicious /
  Malicious) renders as a circular, slightly-rotated double-ring stamp — evoking the official
  rubber stamps ("cachets") used throughout Francophone African administrative documents. It's
  the one place the design takes a real risk, and it's tied directly to the brief: this is a
  *government* tool delivering an *official* verdict.
- **Palette.** Institutional ink colors for risk classification (forest green / ochre / brick
  red) rather than generic Bootstrap red-amber-green. A command-surface navy for the sidebar,
  warm paper for the content area.
- **Type.** IBM Plex Sans + IBM Plex Mono — a typeface family designed for technical/institutional
  contexts, with the mono face used specifically for case numbers, scores, and timestamps so they
  read as data, not prose.
- **One national accent.** A thin Cameroonian tricolor rule appears exactly once, under the
  sidebar brand mark — a restrained nod to "digital patriotism," not a theme slapped everywhere.
- **French-first.** The interface defaults to French (toggleable to English everywhere), matching
  the brief's bilingual requirement and Cameroon's primary administrative language.

---

## Prerequisites

- Node.js 20+ and npm
- The VIGIL-AI backend running and reachable (see the backend's own README)

---

## Quick Start

```bash
cd vigil-ai-frontend

# 1. Install dependencies
npm install

# 2. Configure the backend URL
cp .env.example .env
# Edit .env if your backend isn't on http://localhost:8000

# 3. Start the dev server
npm run dev
```

Visit **http://localhost:5173**. Log in with one of the seed accounts created by the backend's
`scripts/seed_db.py --with-demo-data`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@vigilai.cm` | `VigilAdmin2026!` |
| Analyst | `analyst@antic.cm` | `AnalystPass2026!` |
| Viewer | `viewer@minpostel.cm` | `ViewerPass2026!` |

---

## Available Scripts

```bash
npm run dev        # Start the Vite dev server with HMR
npm run build      # Type-check (tsc -b) then build for production → dist/
npm run preview    # Serve the production build locally for a final check
npm run lint       # Run oxlint
npm run test       # Run the Vitest suite once
npm run test:watch # Run Vitest in watch mode
```

### Verifying everything works

```bash
npm run lint   # 0 errors expected
npx tsc --noEmit -p tsconfig.app.json   # 0 errors expected
npm run test   # 18 tests, all passing
npm run build  # produces dist/ with per-route code-split chunks
```

The production build is route-split: the login screen ships ~4KB of page-specific JS, while the
charting library (Recharts) is isolated into its own chunk that only loads when you actually visit
the dashboard.

---

## Project Structure

```
vigil-ai-frontend/
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Router + route-level code splitting
│   ├── index.css                 # Design tokens (@theme) + global styles
│   ├── types/api.ts               # TypeScript types mirroring backend Pydantic schemas
│   ├── lib/
│   │   ├── api.ts                # Axios instance, JWT injection, refresh-on-401
│   │   └── endpoints.ts          # Typed API functions by resource (auth/cases/submissions/...)
│   ├── context/
│   │   ├── AuthContext.tsx       # Session state, login/logout
│   │   └── LanguageContext.tsx   # FR/EN i18n
│   ├── locales/                  # fr.ts / en.ts translation dictionaries
│   ├── hooks/
│   │   └── useNotifications.ts   # Auto-reconnecting WebSocket → toast notifications
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, VerdictStamp, Feedback states…
│   │   ├── layout/                # Sidebar, Topbar, AppLayout
│   │   └── charts/                # TimelineChart, ContentBreakdownChart (Recharts)
│   ├── pages/                    # One file per route
│   └── test/setup.ts             # Vitest + Testing Library setup
├── vite.config.ts
├── vitest.config.ts
├── tsconfig*.json
├── .env.example
└── README.md (this file)
```

---

## Pages

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Authentication |
| `/forgot-password` | Public | Password reset request |
| `/` | All roles | Dashboard — KPIs, 30-day threat timeline, content-type breakdown, recent high-risk cases |
| `/submit` | Admin, Analyst | Submit text / image / video / audio for AI analysis — media is submitted by URL by default, with an optional file-upload mode for image & audio |
| `/cases` | All roles | Case list with search, status/classification/type filters, CSV export (admin) |
| `/cases/:id` | All roles | Full case investigation workspace — analysis result with dual AI/disinformation score bars, key forensic indicators, media preview, notes, status workflow, escalation |
| `/users` | Admin | User account management |
| `/reports` | All roles | Monthly transparency report (stub — backend generation is phase 2, FR-038) |
| `/audit-log` | Admin | Audit trail (stub — backend records the data; a paginated list endpoint isn't wired up yet) |
| `/settings` | All roles | Profile, language toggle, change password |

Two pages are intentionally left as honest stubs rather than faked with placeholder data: Reports
and Audit Log. The backend already has the underlying data model for both; only the read endpoints
remain to be exposed. The UI says so plainly rather than pretending the feature is complete.

---

## Real-time Notifications

The app opens a WebSocket connection to `/ws/notifications` on login. When a Celery analysis task
completes on the backend, it publishes to Redis, which the FastAPI WebSocket handler relays
straight to the browser — no polling. A toast appears showing the case number, risk score, and a
link straight to the case. The connection auto-reconnects if dropped, and a live/offline indicator
sits in the top bar at all times.

---

## State Management

No Redux/Zustand — the app is small enough that two React Contexts (`AuthContext`,
`LanguageContext`) plus local component state cover every screen cleanly. Server data is fetched
directly with Axios in each page's `useEffect`; there's no client-side cache layer, which keeps
the data model simple and always reflects the backend's current state.

---

## Common Issues

**"Network Error" on every request** → Check `VITE_API_URL` in `.env` points to your running
backend, and that the backend's `CORS_ORIGINS` setting includes `http://localhost:5173`.

**WebSocket shows "Offline" permanently** → The backend's Redis pub/sub subscriber may not have
started, or the JWT token query param was stripped. Check the backend logs for
`Redis pub/sub subscriber started`.

**Login works but every other page redirects back to `/login`** → The access token likely expired
and the refresh token call is failing — check the backend's `/api/v1/auth/refresh` is reachable
and that system clocks aren't skewed.

---

## Next Steps

This is the MVP web frontend. Native mobile (iOS/Android) and the Phase 2 backend features
(scheduled report generation, audit log API, social-media ingestion) are out of scope for this
deliverable per the project charter.
