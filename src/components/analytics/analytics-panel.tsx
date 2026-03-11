import { useMemo, useState } from 'react'
import { useProgressStore, useSessionStore, useTaskStore } from '@/store/app-store'
import { StudyHoursChart } from './study-hours-chart'
import { ActivityHeatmap } from './activity-heatmap'
import { StreakCard } from './streak-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { getStreak } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type DateRange = '7d' | '30d' | '90d' | 'all'

function getRangeStart(range: DateRange): Date | null {
  if (range === 'all') return null
  const now = new Date()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  now.setDate(now.getDate() - days)
  return now
}

export function AnalyticsPanel() {
  const { sessions } = useSessionStore()
  const { tasks, subjects } = useTaskStore()
  const { dailyGoalMinutes } = useProgressStore()

  const [isExporting, setIsExporting] = useState(false)
  const [range, setRange] = useState<DateRange>('30d')

  const filteredSessions = useMemo(() => {
    const start = getRangeStart(range)
    if (!start) return sessions
    return sessions.filter((session) => new Date(session.started_at) >= start)
  }, [sessions, range])

  const filteredTasks = useMemo(() => {
    const start = getRangeStart(range)
    if (!start) return tasks
    return tasks.filter((task) => new Date(task.created_at) >= start)
  }, [tasks, range])

  const totalStudyTime = filteredSessions.reduce((acc, session) => acc + session.duration, 0)
  const completedTasks = filteredTasks.filter((task) => task.completed).length
  const completionRate = filteredTasks.length > 0 ? Math.round((completedTasks / filteredTasks.length) * 100) : 0
  const streak = getStreak(filteredSessions)

  const goalConsistency = Math.max(0, Math.min(100, Math.round((totalStudyTime / Math.max(dailyGoalMinutes, 1)) * 100)))
  const focusScore = Math.round((completionRate * 0.45) + (Math.min(100, streak * 10) * 0.25) + (goalConsistency * 0.3))

  const subjectPieData = useMemo(() => {
    const buckets = new Map<string, { name: string; value: number; color: string }>()

    for (const session of filteredSessions) {
      const subject = subjects.find((item) => item.id === session.subject_id)
      const key = subject?.id || 'general'
      const current = buckets.get(key)
      if (current) {
        current.value += session.duration
      } else {
        buckets.set(key, {
          name: subject?.name || 'General',
          value: session.duration,
          color: subject?.color || '#8b8b8b',
        })
      }
    }

    return Array.from(buckets.values())
  }, [filteredSessions, subjects])

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const reportDate = new Date()

      doc.setFontSize(22)
      doc.text('StudyFlow Progress Report', 20, 20)
      doc.setFontSize(12)
      doc.text(`Generated: ${reportDate.toLocaleString()}`, 20, 30)
      doc.text(`Range: ${range === 'all' ? 'All time' : range.toUpperCase()}`, 20, 38)

      doc.setFontSize(14)
      doc.text('Overview', 20, 52)
      doc.setFontSize(12)
      doc.text(`Total Study Time: ${Math.floor(totalStudyTime / 60)}h ${totalStudyTime % 60}m`, 20, 62)
      doc.text(`Total Sessions: ${filteredSessions.length}`, 20, 70)
      doc.text(`Task Completion Rate: ${completionRate}%`, 20, 78)
      doc.text(`Productivity Score: ${focusScore}%`, 20, 86)

      doc.save(`studyflow-report-${reportDate.toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">View your study progress and insights</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={range} onValueChange={(value) => setRange(value as DateRange)}>
            <TabsList>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="30d">30D</TabsTrigger>
              <TabsTrigger value="90d">90D</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleExportPDF} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Preparing...' : 'Export PDF'}
          </Button>
        </div>
      </motion.div>

      <StreakCard sessions={filteredSessions} />

      <div className="grid gap-6 lg:grid-cols-2">
        <StudyHoursChart sessions={filteredSessions} />
        <Card>
          <CardHeader>
            <CardTitle>Summary Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Study Time</span>
              <span className="font-medium">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Sessions</span>
              <span className="font-medium">{filteredSessions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Task Completion Rate</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goal Consistency</span>
              <span className="font-medium">{goalConsistency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Productivity Score</span>
              <span className="font-medium">{focusScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Study Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {subjectPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={96}
                      dataKey="value"
                      nameKey="name"
                    >
                      {subjectPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${Math.floor(value / 60)}h ${value % 60}m`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No subject distribution data in this range.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressLine label="Task completion" value={completionRate} />
            <ProgressLine label="Consistency streak" value={Math.min(100, streak * 10)} />
            <ProgressLine label="Goal consistency" value={goalConsistency} />
            <div className="rounded-lg border p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">Overall productivity</p>
              <p className="text-2xl font-semibold">{focusScore}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityHeatmap sessions={filteredSessions} />
    </div>
  )
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded bg-secondary">
        <div className="h-2 rounded bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
