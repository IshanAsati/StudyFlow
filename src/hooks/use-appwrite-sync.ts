import { useEffect } from 'react'
import { ID, Permission, Query, Role } from 'appwrite'
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_DISTRACTIONS_COLLECTION_ID,
  APPWRITE_SESSIONS_COLLECTION_ID,
  APPWRITE_SUBJECTS_COLLECTION_ID,
  APPWRITE_TASKS_COLLECTION_ID,
  appwriteDatabases,
  isAppwriteFullyConfigured,
  type Subject,
  type Task,
  type StudySession,
} from '@/lib/appwrite'
import { useAuth } from '@/hooks/use-auth'
import {
  useDistractionStore,
  useProgressStore,
  useSessionStore,
  useTaskStore,
} from '@/store/app-store'

const collectionPermissions = [Permission.read(Role.users()), Permission.write(Role.users())]

function normalizeSubject(doc: any): Subject {
  return {
    id: doc.$id,
    user_id: doc.user_id,
    name: doc.name,
    color: doc.color,
    created_at: doc.created_at,
  }
}

function normalizeTask(doc: any): Task {
  return {
    id: doc.$id,
    user_id: doc.user_id,
    subject_id: doc.subject_id || null,
    title: doc.title,
    description: doc.description || null,
    completed: Boolean(doc.completed),
    completed_at: doc.completed_at || null,
    due_date: doc.due_date || null,
    priority: doc.priority || 'medium',
    archived: Boolean(doc.archived),
    order: Number(doc.order || 0),
    created_at: doc.created_at,
  }
}

function normalizeSession(doc: any): StudySession {
  return {
    id: doc.$id,
    user_id: doc.user_id,
    subject_id: doc.subject_id || null,
    duration: Number(doc.duration || 0),
    started_at: doc.started_at,
    completed_at: doc.completed_at || null,
  }
}

async function replaceCollection(
  collectionId: string,
  userId: string,
  payload: Array<{ id: string; data: Record<string, unknown> }>
) {
  const existing = await appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, collectionId, [
    Query.equal('user_id', userId),
  ])

  await Promise.all(
    existing.documents.map((doc: any) =>
      appwriteDatabases.deleteDocument(APPWRITE_DATABASE_ID, collectionId, doc.$id)
    )
  )

  await Promise.all(
    payload.map((item) =>
      appwriteDatabases.createDocument(
        APPWRITE_DATABASE_ID,
        collectionId,
        item.id || ID.unique(),
        item.data,
        collectionPermissions
      )
    )
  )
}

export function useAppwriteSync() {
  const { user, configured } = useAuth()

  const { tasks, subjects, setTasks, setSubjects } = useTaskStore()
  const { sessions, setSessions } = useSessionStore()
  const { events } = useDistractionStore()
  const { xp, dailyGoalMinutes, weeklyGoalSessions, unlockedBadges } = useProgressStore()

  useEffect(() => {
    if (!configured || !isAppwriteFullyConfigured || !user) return

    let cancelled = false

    const load = async () => {
      try {
        const [subjectsRes, tasksRes, sessionsRes] = await Promise.all([
          appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_SUBJECTS_COLLECTION_ID, [
            Query.equal('user_id', user.id),
          ]),
          appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_TASKS_COLLECTION_ID, [
            Query.equal('user_id', user.id),
          ]),
          appwriteDatabases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_SESSIONS_COLLECTION_ID, [
            Query.equal('user_id', user.id),
          ]),
        ])

        if (cancelled) return

        setSubjects(subjectsRes.documents.map(normalizeSubject))
        setTasks(tasksRes.documents.map(normalizeTask))
        setSessions(sessionsRes.documents.map(normalizeSession))

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
      } catch {
        // Keep local state if remote is unavailable
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [configured, user, setSubjects, setTasks, setSessions])

  useEffect(() => {
    if (!configured || !isAppwriteFullyConfigured || !user) return

    replaceCollection(
      APPWRITE_SUBJECTS_COLLECTION_ID,
      user.id,
      subjects.map((subject) => ({
        id: subject.id,
        data: {
          user_id: user.id,
          name: subject.name,
          color: subject.color,
          created_at: subject.created_at,
        },
      }))
    ).catch(() => undefined)
  }, [configured, user, subjects])

  useEffect(() => {
    if (!configured || !isAppwriteFullyConfigured || !user) return

    replaceCollection(
      APPWRITE_TASKS_COLLECTION_ID,
      user.id,
      tasks.map((task) => ({
        id: task.id,
        data: {
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
      }))
    ).catch(() => undefined)
  }, [configured, user, tasks])

  useEffect(() => {
    if (!configured || !isAppwriteFullyConfigured || !user) return

    replaceCollection(
      APPWRITE_SESSIONS_COLLECTION_ID,
      user.id,
      sessions.map((session) => ({
        id: session.id,
        data: {
          user_id: user.id,
          subject_id: session.subject_id,
          duration: session.duration,
          started_at: session.started_at,
          completed_at: session.completed_at,
        },
      }))
    ).catch(() => undefined)
  }, [configured, user, sessions])

  useEffect(() => {
    if (!configured || !isAppwriteFullyConfigured || !user) return

    replaceCollection(
      APPWRITE_DISTRACTIONS_COLLECTION_ID,
      user.id,
      events.map((event) => ({
        id: event.id,
        data: {
          user_id: user.id,
          session_id: event.sessionId,
          timestamp: event.timestamp,
          type: event.type,
        },
      }))
    ).catch(() => undefined)
  }, [configured, user, events])

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
}
