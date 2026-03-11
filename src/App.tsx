import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from '@/hooks/use-theme'
import { useAuth } from '@/hooks/use-auth'
import { useAppwriteSync } from '@/hooks/use-appwrite-sync'
import { Layout } from '@/components/layout/layout'
import { AuthGuard } from '@/components/auth/auth-guard'

const Dashboard = lazy(() => import('@/components/dashboard/dashboard').then((module) => ({ default: module.Dashboard })))
const TimerPage = lazy(() => import('@/pages/timer-page').then((module) => ({ default: module.TimerPage })))
const TasksPage = lazy(() => import('@/pages/tasks-page').then((module) => ({ default: module.TasksPage })))
const AnalyticsPage = lazy(() => import('@/pages/analytics-page').then((module) => ({ default: module.AnalyticsPage })))
const AuthPage = lazy(() => import('@/pages/auth-page').then((module) => ({ default: module.AuthPage })))

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function AppRoutes() {
  const { configured, user } = useAuth()
  useAppwriteSync()
  const location = useLocation()

  const AppShell = (
    <Layout>
      <Routes>
        <Route path="/" element={<PageTransition><Suspense fallback={null}><Dashboard /></Suspense></PageTransition>} />
        <Route path="/timer" element={<PageTransition><Suspense fallback={null}><TimerPage /></Suspense></PageTransition>} />
        <Route path="/tasks" element={<PageTransition><Suspense fallback={null}><TasksPage /></Suspense></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><Suspense fallback={null}><AnalyticsPage /></Suspense></PageTransition>} />
      </Routes>
    </Layout>
  )

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/auth"
          element={
            configured && user ? (
              <PageTransition>
                <Layout>
                  <Suspense fallback={null}><Dashboard /></Suspense>
                </Layout>
              </PageTransition>
            ) : (
              <PageTransition>
                <Suspense fallback={null}><AuthPage /></Suspense>
              </PageTransition>
            )
          }
        />
        <Route
          path="*"
          element={
            <AuthGuard>
              {AppShell}
            </AuthGuard>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
