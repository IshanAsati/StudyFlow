# StudyFlow

StudyFlow is a productivity app for students with Pomodoro timing, task management, distraction tracking, and analytics.

## Highlights

- Pomodoro timer with focus/break/long-break modes
- Task management with subjects, priorities, due dates, archive, and drag-and-drop ordering
- Distraction logging and analytics dashboards
- Gamification: XP, levels, streaks, and achievements
- PDF export and keyboard shortcuts
- Appwrite-backed auth and sync support

## Tech Stack

- React 18 + TypeScript + Vite
- Zustand for state management
- Tailwind CSS + Radix UI primitives
- Recharts + Framer Motion
- Appwrite SDK + Node Appwrite SDK

## Environment Variables

Create `.env` from `.env.example` and provide:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`
- `VITE_APPWRITE_SUBJECTS_COLLECTION_ID`
- `VITE_APPWRITE_TASKS_COLLECTION_ID`
- `VITE_APPWRITE_SESSIONS_COLLECTION_ID`
- `VITE_APPWRITE_DISTRACTIONS_COLLECTION_ID`
- `VITE_APPWRITE_EXPORTS_BUCKET_ID`

## Local Development

```bash
npm install
npm run dev
```

## Appwrite Provisioning Script

You can provision database/collections/bucket with:

```bash
APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1" \
APPWRITE_PROJECT_ID="<project-id>" \
APPWRITE_API_KEY="<server-api-key>" \
node scripts/setup-appwrite.mjs
```

The script prints `VITE_*` values to copy into `.env`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Notes for Maintainers

- Appwrite sync currently uses full-collection replacement strategy per user for deterministic behavior.
- If scale increases, move to incremental diff/upsert sync.
- Keep `.env` out of git; use `.env.example` as template.
