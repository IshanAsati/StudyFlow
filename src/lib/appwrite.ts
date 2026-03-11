import { Account, Client, Databases, Storage } from 'appwrite'

export type User = {
  id: string
  email: string
  name: string
  created_at: string
}

export type Subject = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type Task = {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  description: string | null
  completed: boolean
  completed_at?: string | null
  due_date?: string | null
  priority?: 'low' | 'medium' | 'high'
  archived?: boolean
  order: number
  created_at: string
  subject?: Subject
}

export type StudySession = {
  id: string
  user_id: string
  subject_id: string | null
  duration: number
  started_at: string
  completed_at: string | null
  subject?: Subject
}

export type Distraction = {
  id: string
  user_id: string
  session_id: string | null
  timestamp: string
  type: 'tab-switch' | 'idle' | 'notification'
}

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || ''
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || ''
export const APPWRITE_SUBJECTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SUBJECTS_COLLECTION_ID || ''
export const APPWRITE_TASKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID || ''
export const APPWRITE_SESSIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SESSIONS_COLLECTION_ID || ''
export const APPWRITE_DISTRACTIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_DISTRACTIONS_COLLECTION_ID || ''
export const APPWRITE_EXPORTS_BUCKET_ID = import.meta.env.VITE_APPWRITE_EXPORTS_BUCKET_ID || ''

export const isAppwriteConfigured = Boolean(APPWRITE_ENDPOINT && APPWRITE_PROJECT_ID)
export const isAppwriteFullyConfigured = Boolean(
  APPWRITE_ENDPOINT &&
    APPWRITE_PROJECT_ID &&
    APPWRITE_DATABASE_ID &&
    APPWRITE_SUBJECTS_COLLECTION_ID &&
    APPWRITE_TASKS_COLLECTION_ID &&
    APPWRITE_SESSIONS_COLLECTION_ID &&
    APPWRITE_DISTRACTIONS_COLLECTION_ID
)

export const appwriteClient = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)

export const appwriteAccount = new Account(appwriteClient)
export const appwriteDatabases = new Databases(appwriteClient)
export const appwriteStorage = new Storage(appwriteClient)

export function getAppwriteConfigDebug() {
  return {
    endpoint: APPWRITE_ENDPOINT,
    projectId: APPWRITE_PROJECT_ID,
    databaseId: APPWRITE_DATABASE_ID,
    configured: isAppwriteConfigured,
    fullyConfigured: isAppwriteFullyConfigured,
  }
}
