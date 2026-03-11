import { useEffect, useRef } from 'react'
import { ID, Permission, Query, Role } from 'appwrite'
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_DISTRACTIONS_COLLECTION_ID,
  APPWRITE_SESSIONS_COLLECTION_ID,
  APPWRITE_SUBJECTS_COLLECTION_ID,
  APPWRITE_TASKS_COLLECTION_ID,
  appwriteDatabases,
  isAppwriteConfigured,
} from '@/lib/appwrite'
import { useAuth } from '@/hooks/use-auth'
import {
  useDistractionStore,
  useProgressStore,
  useSessionStore,
  useTaskStore,
  useTimerStore,
} from '@/store/app-store'

const collectionPermissions = [
  Permission.read(Role.users()),
  Permission.write(Role.users()),
]

export function useAppwriteSync() {
  const { user } = useAuth()
  const isHydratedRef = useRef(false)
  const syncingRef = useRef(false)

  const { tasks, subjects, setTasks, setSubjects, reset: resetTasks } = useTaskStore()
  const { sessions, setSessions, reset: resetSessions } = useSessionStore()
  const { events, reset: resetDistractions } = useDistractionStore()
  const { xp, dailyGoalMinutes, weeklyGoalSessions, unlockedBadges, reset: resetProgress } = useProgressStore()

  useEffect(() => {
    if (!isAppwriteConfigured || !user) {
      isHydratedRef.current = false
      return
    }

    let mounted = true

    const hydrate = async () => {
      syncingRef.current = true
      try {
        const [subjectsRes, tasksRes, sessionsRes, distractionsRes] = await Promise.all([
          appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_SUBJECTS_COLLECTION_ID, [Query.equal('user_id', user.id)]),
          appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_TASKS_COLLECTION_ID, [Query.equal('user_id', user.id)]),
          appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_SESSIONS_COLLECTION_ID, [Query.equal('user_id', user.id)]),
          appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_DISTRACTIONS_COLLECTION_ID, [Query.equal('user_id', user.id)]),
        ])

        if (!mounted) return

        setSubjects(subjectsRes.documents.map((doc: any) => ({ ...doc, id: doc.$id })))
        setTasks(tasksRes.documents.map((doc: any) => ({ ...doc, id: doc.$id })))
        setSessions(sessionsRes.documents.map((doc: any) => ({ ...doc, id: doc.$id })))

        useDistractionStore.setState({
          events: distractionsRes.documents.map((doc: any) => ({
            id: doc.$id,
            type: doc.type,
            timestamp: doc.timestamp,
            sessionId: doc.session_id || null,
          })),
          distractions: distractionsRes.total,
        })

        const progressRaw = localStorage.getItem(`studyflow-progress-${user.id}`)
        if (progressRaw) {
          const progress = JSON.parse(progressRaw)
          useProgressStore.setState({
            xp: progress.xp ?? 0,
            dailyGoalMinutes: progress.dailyGoalMinutes ?? 120,
            weeklyGoalSessions: progress.weeklyGoalSessions ?? 20,
            unlockedBadges: Array.isArray(progress.unlockedBadges) ? progress.unlockedBadges : [],
          })
        }

        isHydratedRef.current = true
      } catch {
        isHydratedRef.current = true
      } finally {
        syncingRef.current = false
      }
    }

    hydrate()

    return () => {
      mounted = false
    }
  }, [user, setSessions, setSubjects, setTasks])

  useEffect(() => {
    if (!isAppwriteConfigured || !user || !isHydratedRef.current || syncingRef.current) return

    const sync = async () => {
      syncingRef.current = true
      try {
        const existing = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_SUBJECTS_COLLECTION_ID, [Query.equal('user_id', user.id)])
        await Promise.all(existing.documents.map((doc: any) => appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_SUBJECTS_COLLECTION_ID, doc.$id)))
        await Promise.all(
          subjects.map((subject) =>
            appwriteDatabases.createDocument(
              APPWRITE_DATABASE_ID,
              APPWRITE_SUBJECTS_COLLECTION_ID,
              subject.id || ID.unique(),
              {
                user_id: user.id,
                name: subject.name,
                color: subject.color,
                created_at: subject.created_at,
              },
              collectionPermissions
            )
          )
        )
      } finally {
        syncingRef.current = false
      }
    }

    sync()
  }, [subjects, user])

  useEffect(() => {
    if (!isAppwriteConfigured || !user || !isHydratedRef.current || syncingRef.current) return

    const sync = async () => {
      syncingRef.current = true
      try {
        const existing = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_TASKS_COLLECTION_ID, [Query.equal('user_id', user.id)])
        await Promise.all(existing.documents.map((doc: any) => appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_TASKS_COLLECTION_ID, doc.$id)))
        await Promise.all(
          tasks.map((task) =>
            appwriteDatabases.createDocument(
              APPWRITE_DATABASE_ID,
              APPWRITE_TASKS_COLLECTION_ID,
              task.id || ID.unique(),
              {
                user_id: user.id,
                subject_id: task.subject_id,
                title: task.title,
                description: task.description,
                completed: task.completed,
                completed_at: task.completed_at || null,
                due_date: task.due_date || null,
                priority: task.priority || 'medium',
                archived: Boolean(task.archived),
                order: task.order,
                created_at: task.created_at,
              },
              collectionPermissions
            )
          )
        )
      } finally {
        syncingRef.current = false
      }
    }

    sync()
  }, [tasks, user])

  useEffect(() => {
    if (!isAppwriteConfigured || !user || !isHydratedRef.current || syncingRef.current) return

    const sync = async () => {
      syncingRef.current = true
      try {
        const existing = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_SESSIONS_COLLECTION_ID, [Query.equal('user_id', user.id)])
        await Promise.all(existing.documents.map((doc: any) => appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_SESSIONS_COLLECTION_ID, doc.$id)))
        await Promise.all(
          sessions.map((session) =>
            appwriteDatabases.createDocument(
              APPWRITE_DATABASE_ID,
              APPWRITE_SESSIONS_COLLECTION_ID,
              session.id || ID.unique(),
              {
                user_id: user.id,
                subject_id: session.subject_id,
                duration: session.duration,
                started_at: session.started_at,
                completed_at: session.completed_at,
              },
              collectionPermissions
            )
          )
        )
      } finally {
        syncingRef.current = false
      }
    }

    sync()
  }, [sessions, user])

  useEffect(() => {
    if (!isAppwriteConfigured || !user || !isHydratedRef.current || syncingRef.current) return

    const sync = async () => {
      syncingRef.current = true
      try {
        const existing = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_DISTRACTIONS_COLLECTION_ID, [Query.equal('user_id', user.id)])
        await Promise.all(existing.documents.map((doc: any) => appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_DISTRACTIONS_COLLECTION_ID, doc.$id)))
        await Promise.all(
          events.map((event) =>
            appwriteDatabases.createDocument(
              APPWRITE_DATABASE_ID,
              APPWRITE_DISTRACTIONS_COLLECTION_ID,
              event.id || ID.unique(),
              {
                user_id: user.id,
                session_id: event.sessionId,
                timestamp: event.timestamp,
                type: event.type,
              },
              collectionPermissions
            )
          )
        )
      } finally {
        syncingRef.current = false
      }
    }

    sync()
  }, [events, user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(
      `studyflow-progress-${user.id}`,
      JSON.stringify({
        xp,
        dailyGoalMinutes,
        weeklyGoalSessions,
        unlockedBadges,
      })
    )
  }, [user, xp, dailyGoalMinutes, weeklyGoalSessions, unlockedBadges])

  useEffect(() => {
    if (!user) return
    useTimerStore.setState({ sessionId: user.id })
  }, [user])

  const clearAllLocalState = () => {
    resetTasks()
    resetSessions()
    resetDistractions()
    resetProgress()
    useTimerStore.setState({
      currentSubjectId: null,
      sessionId: null,
      completedSessions: 0,
      mode: 'focus',
      isRunning: false,
      isPaused: false,
    })
  }

  return {
    clearAllLocalState,
  }
}
