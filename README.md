# StudyFlow

A modern web app for high-school students to track and improve study habits.

## Features

- **Dashboard** - View today's tasks, total study time, active streak, and weekly progress
- **Pomodoro Timer** - 25min focus/5min break sessions with custom durations and visual progress ring
- **Task Manager** - Organize tasks by subjects with drag-and-drop ordering
- **Analytics** - Track daily/weekly progress with charts and streak counter
- **Distraction Tracking** - Tab switch detection and interruption logging
- **Dark/Light Mode** - Toggle between themes
- **Offline Support** - localStorage fallback for offline usage
- **PDF Export** - Generate progress reports

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui patterns with Radix UI primitives
- **State Management**: Zustand
- **Charts**: Recharts
- **Backend**: Supabase (optional - app works offline with localStorage)
- **Routing**: React Router v6
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set up Supabase:
   - Create a `.env` file based on `.env.example`
   - Add your Supabase URL and anon key
   - Run the SQL schema in `supabase/schema.sql` in your Supabase SQL Editor

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## Keyboard Shortcuts

- `t` - Toggle timer
- `n` - New task
- `d` - Toggle dark mode
- `?` - Show keyboard shortcuts

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn UI components
│   ├── dashboard/       # Dashboard widgets
│   ├── pomodoro/        # Timer components
│   ├── tasks/           # Task manager components
│   ├── analytics/       # Charts and stats
│   └── layout/          # Header, sidebar, theme toggle
├── hooks/               # Custom React hooks
├── lib/                 # Utils, Supabase client
├── pages/               # Page components
├── store/               # Zustand state stores
├── types/               # TypeScript types
└── styles/              # Global styles
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

## License

MIT
