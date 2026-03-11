import { useEffect } from 'react'
import { useTimerStore, useTaskStore, useSessionStore, useProgressStore } from '@/store/app-store'
import { StatsCard } from './stats-card'
import { TasksWidget } from './tasks-widget'
import { WeeklyProgress } from './weekly-progress'
import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer'
import { Clock, CheckCircle, TrendingUp, Flame, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { getLevelFromXp, getStreak, getXpProgressInLevel } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export function Dashboard() {
  const { completedSessions } = useTimerStore()
  const { tasks } = useTaskStore()
  const { sessions } = useSessionStore()
  const { xp, dailyGoalMinutes, weeklyGoalSessions, syncMilestones, grantDailyStreakBonus } = useProgressStore()

  // Calculate stats
  const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration, 0)
  const completedTasks = tasks.filter((t) => t.completed).length
  const pendingTasks = tasks.filter((t) => !t.completed).length

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const sessionsThisWeek = sessions.filter(
    (session) => new Date(session.started_at) >= weekStart
  ).length
  const weeklyGoal = weeklyGoalSessions

  const streak = getStreak(sessions)
  const level = getLevelFromXp(xp)
  const xpProgress = getXpProgressInLevel(xp)

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const todayMinutes = sessions
    .filter((session) => new Date(session.started_at) >= startOfToday)
    .reduce((total, session) => total + session.duration, 0)
  const dailyGoalProgress = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))

  useEffect(() => {
    syncMilestones({
      completedSessions,
      completedTasks,
      streak,
    })
    grantDailyStreakBonus(streak)
  }, [completedSessions, completedTasks, streak, syncMilestones, grantDailyStreakBonus])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track your study progress and habits</p>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <StatsCard
          title="Total Study Time"
          value={`${Math.floor(totalStudyTime / 60)}h ${totalStudyTime % 60}m`}
          icon={Clock}
          description="All time"
        />
        <StatsCard
          title="Completed Tasks"
          value={completedTasks}
          icon={CheckCircle}
          description={`${pendingTasks} pending`}
        />
        <StatsCard
          title="Sessions Completed"
          value={completedSessions}
          icon={TrendingUp}
          description="Pomodoro sessions"
        />
        <StatsCard
          title="Current Streak"
          value={`${streak} days`}
          icon={Flame}
          description="Keep it up!"
        />
        <StatsCard
          title="Current Level"
          value={`Lv ${level}`}
          icon={Star}
          description={`${xpProgress.current}/${xpProgress.needed} XP`}
        />
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PomodoroTimer />
        <TasksWidget />
        <WeeklyProgress sessionsThisWeek={sessionsThisWeek} weeklyGoal={weeklyGoal} />
        <Card>
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today's Focus Time</span>
              <span className="font-medium">{todayMinutes}/{dailyGoalMinutes} min</span>
            </div>
            <Progress value={dailyGoalProgress} />
            <p className="text-xs text-muted-foreground">
              {dailyGoalProgress >= 100 ? 'Goal complete! Bonus consistency XP awarded daily.' : `${Math.max(0, dailyGoalMinutes - todayMinutes)} min to hit your goal.`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Start a focus session to begin tracking your study time.
            </p>
            <p className="text-sm text-muted-foreground">
              Add tasks to keep track of what you need to study.
            </p>
            <p className="text-sm text-muted-foreground">
              Check your analytics to see your progress over time.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
