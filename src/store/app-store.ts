import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, Subject, StudySession } from '@/lib/appwrite'

interface TimerState {
  isRunning: boolean
  isPaused: boolean
  mode: 'focus' | 'break' | 'long-break'
  timeRemaining: number
  focusDuration: number
  breakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  completedSessions: number
  currentSubjectId: string | null
  sessionId: string | null
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  tick: () => void
  skipToNext: () => void
  setMode: (mode: 'focus' | 'break' | 'long-break') => void
  setFocusDuration: (duration: number) => void
  setBreakDuration: (duration: number) => void
  setLongBreakDuration: (duration: number) => void
  setSessionsUntilLongBreak: (count: number) => void
  setCurrentSubjectId: (subjectId: string | null) => void
  setSessionId: (sessionId: string | null) => void
}

interface TaskState {
  tasks: Task[]
  subjects: Subject[]
  selectedSubject: string | null
  addTask: (task: Partial<Task>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string, completed: boolean) => void
  reorderTasks: (taskId: string, newIndex: number) => void
  addSubject: (subject: Partial<Subject>) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void
  setTasks: (tasks: Task[]) => void
  setSubjects: (subjects: Subject[]) => void
  setSelectedSubject: (subjectId: string | null) => void
  reset: () => void
}

interface SessionState {
  sessions: StudySession[]
  addSession: (session: Partial<StudySession>) => void
  setSessions: (sessions: StudySession[]) => void
  reset: () => void
}

interface DistractionEvent {
  id: string
  type: 'tab-switch' | 'idle' | 'notification'
  timestamp: string
  sessionId: string | null
}

interface DistractionState {
  distractions: number
  currentSessionId: string | null
  events: DistractionEvent[]
  logDistraction: (type: 'tab-switch' | 'idle' | 'notification') => void
  resetDistractions: () => void
  setCurrentSessionId: (sessionId: string | null) => void
  reset: () => void
}

interface ProgressState {
  xp: number
  dailyGoalMinutes: number
  weeklyGoalSessions: number
  unlockedBadges: string[]
  lastStreakBonusDate: string | null
  addXp: (amount: number) => void
  setDailyGoalMinutes: (minutes: number) => void
  setWeeklyGoalSessions: (sessions: number) => void
  syncMilestones: (payload: { completedSessions: number; completedTasks: number; streak: number }) => void
  grantDailyStreakBonus: (streak: number) => void
  reset: () => void
}

const BADGE_IDS = {
  firstFocus: 'first-focus',
  sessions10: 'sessions-10',
  sessions50: 'sessions-50',
  tasks25: 'tasks-25',
  streak7: 'streak-7',
  xp500: 'xp-500',
} as const

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      isPaused: false,
      mode: 'focus',
      timeRemaining: 25 * 60,
      focusDuration: 25 * 60,
      breakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      sessionsUntilLongBreak: 4,
      completedSessions: 0,
      currentSubjectId: null,
      sessionId: null,
      startTimer: () => set({ isRunning: true, isPaused: false }),
      pauseTimer: () => set({ isPaused: true }),
      stopTimer: () => set({ isRunning: false, isPaused: false }),
      resetTimer: () => {
        const { mode, focusDuration, breakDuration, longBreakDuration } = get()
        set({
          isRunning: false,
          isPaused: false,
          timeRemaining:
            mode === 'focus'
              ? focusDuration
              : mode === 'break'
                ? breakDuration
                : longBreakDuration,
        })
      },
      tick: () => {
        const {
          timeRemaining,
          mode,
          focusDuration,
          breakDuration,
          longBreakDuration,
          sessionsUntilLongBreak,
          completedSessions,
        } = get()
        if (timeRemaining > 1) {
          set({ timeRemaining: timeRemaining - 1 })
        } else {
          if (mode === 'focus') {
            const nextCompletedSessions = completedSessions + 1
            const shouldUseLongBreak = nextCompletedSessions % sessionsUntilLongBreak === 0
            set({
              mode: shouldUseLongBreak ? 'long-break' : 'break',
              timeRemaining: shouldUseLongBreak ? longBreakDuration : breakDuration,
              completedSessions: nextCompletedSessions,
              isRunning: false,
              isPaused: false,
            })
          } else {
            set({
              mode: 'focus',
              timeRemaining: focusDuration,
              isRunning: false,
              isPaused: false,
            })
          }
        }
      },
      skipToNext: () => {
        const { mode, focusDuration, breakDuration } = get()
        if (mode === 'focus') {
          set({
            mode: 'break',
            timeRemaining: breakDuration,
            isRunning: false,
            isPaused: false,
          })
        } else {
          set({
            mode: 'focus',
            timeRemaining: focusDuration,
            isRunning: false,
            isPaused: false,
          })
        }
      },
      setMode: (mode: 'focus' | 'break' | 'long-break') => {
        const { focusDuration, breakDuration, longBreakDuration } = get()
        set({
          mode,
          isRunning: false,
          isPaused: false,
          timeRemaining:
            mode === 'focus'
              ? focusDuration
              : mode === 'break'
                ? breakDuration
                : longBreakDuration,
        })
      },
      setFocusDuration: (duration: number) => {
        set({ focusDuration: duration })
        if (get().mode === 'focus' && !get().isRunning) {
          set({ timeRemaining: duration })
        }
      },
      setBreakDuration: (duration: number) => {
        set({ breakDuration: duration })
        if (get().mode === 'break' && !get().isRunning) {
          set({ timeRemaining: duration })
        }
      },
      setLongBreakDuration: (duration: number) => {
        set({ longBreakDuration: duration })
        if (get().mode === 'long-break' && !get().isRunning) {
          set({ timeRemaining: duration })
        }
      },
      setSessionsUntilLongBreak: (count: number) => {
        set({ sessionsUntilLongBreak: Math.max(2, count) })
      },
      setCurrentSubjectId: (subjectId: string | null) => set({ currentSubjectId: subjectId }),
      setSessionId: (sessionId: string | null) => set({ sessionId }),
    }),
    {
      name: 'timer-storage',
      partialize: (state) => ({
        mode: state.mode,
        timeRemaining: state.timeRemaining,
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        focusDuration: state.focusDuration,
        breakDuration: state.breakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        completedSessions: state.completedSessions,
        currentSubjectId: state.currentSubjectId,
      }),
    }
  )
)

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      subjects: [],
      selectedSubject: null,
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              title: task.title || '',
              description: task.description,
              subject_id: task.subject_id,
              completed: false,
              completed_at: null,
              due_date: task.due_date || null,
              priority: task.priority || 'medium',
              archived: false,
              order: state.tasks.length,
              user_id: '',
              created_at: new Date().toISOString(),
            } as Task,
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      toggleTask: (id, completed) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t
            const wasCompleted = t.completed
            if (!wasCompleted && completed) {
              useProgressStore.getState().addXp(5)
            }
            return {
              ...t,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
              archived: completed ? t.archived : false,
            }
          }),
        })),
      reorderTasks: (taskId, newIndex) =>
        set((state) => {
          const tasks = [...state.tasks]
          const taskIndex = tasks.findIndex((t) => t.id === taskId)
          if (taskIndex === -1 || newIndex < 0 || newIndex >= tasks.length) {
            return state
          }
          const task = tasks[taskIndex]
          tasks.splice(taskIndex, 1)
          tasks.splice(newIndex, 0, task)
          return {
            tasks: tasks.map((t, i) => ({ ...t, order: i })),
          }
        }),
      addSubject: (subject) =>
        set((state) => ({
          subjects: [
            ...state.subjects,
            {
              id: crypto.randomUUID(),
              name: subject.name || '',
              color: subject.color || '#6366f1',
              user_id: '',
              created_at: new Date().toISOString(),
            } as Subject,
          ],
        })),
      updateSubject: (id, updates) =>
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
          tasks: state.tasks.map((t) =>
            t.subject_id === id ? { ...t, subject_id: null } : t
          ),
        })),
      setTasks: (tasks: Task[]) => set({ tasks }),
      setSubjects: (subjects: Subject[]) => set({ subjects }),
      setSelectedSubject: (subjectId: string | null) => set({ selectedSubject: subjectId }),
      reset: () => set({ tasks: [], subjects: [], selectedSubject: null }),
    }),
    { name: 'task-storage' }
  )
)

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (session) =>
        set((state) => {
          useProgressStore.getState().addXp(10)
          return {
            sessions: [
              ...state.sessions,
              {
                id: crypto.randomUUID(),
                duration: session.duration || 0,
                started_at: session.started_at || new Date().toISOString(),
                completed_at: new Date().toISOString(),
                user_id: '',
                subject_id: session.subject_id,
              } as StudySession,
            ],
          }
        }),
      setSessions: (sessions: StudySession[]) => set({ sessions }),
      reset: () => set({ sessions: [] }),
    }),
    { name: 'session-storage' }
  )
)

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      dailyGoalMinutes: 120,
      weeklyGoalSessions: 20,
      unlockedBadges: [],
      lastStreakBonusDate: null,
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      setDailyGoalMinutes: (minutes) => set({ dailyGoalMinutes: Math.max(15, minutes) }),
      setWeeklyGoalSessions: (sessions) => set({ weeklyGoalSessions: Math.max(1, sessions) }),
      syncMilestones: ({ completedSessions, completedTasks, streak }) => {
        const next = new Set(get().unlockedBadges)
        if (completedSessions >= 1) next.add(BADGE_IDS.firstFocus)
        if (completedSessions >= 10) next.add(BADGE_IDS.sessions10)
        if (completedSessions >= 50) next.add(BADGE_IDS.sessions50)
        if (completedTasks >= 25) next.add(BADGE_IDS.tasks25)
        if (streak >= 7) next.add(BADGE_IDS.streak7)
        if (get().xp >= 500) next.add(BADGE_IDS.xp500)
        set({ unlockedBadges: Array.from(next) })
      },
      grantDailyStreakBonus: (streak) => {
        if (streak < 3) return
        const today = new Date().toISOString().slice(0, 10)
        if (get().lastStreakBonusDate === today) return
        set((state) => ({
          xp: state.xp + 15,
          lastStreakBonusDate: today,
        }))
      },
      reset: () =>
        set({
          xp: 0,
          dailyGoalMinutes: 120,
          weeklyGoalSessions: 20,
          unlockedBadges: [],
          lastStreakBonusDate: null,
        }),
    }),
    {
      name: 'progress-storage',
    }
  )
)

export const useDistractionStore = create<DistractionState>()(
  persist(
    (set, get) => ({
      distractions: 0,
      currentSessionId: null,
      events: [],
      logDistraction: (type) => {
        const event: DistractionEvent = {
          id: crypto.randomUUID(),
          type,
          timestamp: new Date().toISOString(),
          sessionId: get().currentSessionId,
        }
        set((state) => ({
          distractions: state.distractions + 1,
          events: [event, ...state.events],
        }))
      },
      resetDistractions: () => set({ distractions: 0, events: [] }),
      setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
      reset: () => set({ distractions: 0, currentSessionId: null, events: [] }),
    }),
    { name: 'distraction-storage' }
  )
)
