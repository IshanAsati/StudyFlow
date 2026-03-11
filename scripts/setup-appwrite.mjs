import process from 'node:process'
import * as sdk from 'node-appwrite'

const endpoint = process.env.APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY

if (!endpoint || !projectId || !apiKey) {
  console.error('Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY')
  process.exit(1)
}

const client = new sdk.Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey)

const databases = new sdk.Databases(client)
const storage = new sdk.Storage(client)

const ensureCollection = async (databaseId, collectionId, name) => {
  try {
    await databases.getCollection(databaseId, collectionId)
    return collectionId
  } catch {
    await databases.createCollection(databaseId, collectionId, name, [], true, true)
    return collectionId
  }
}

const ensureDatabase = async (databaseId, name) => {
  try {
    await databases.get(databaseId)
    return databaseId
  } catch {
    await databases.create(databaseId, name)
    return databaseId
  }
}

const ensureBucket = async (bucketId, name) => {
  try {
    await storage.getBucket(bucketId)
    return bucketId
  } catch {
    await storage.createBucket(bucketId, name)
    return bucketId
  }
}

const ensureAttribute = async (fn) => {
  try {
    await fn()
  } catch (error) {
    const message = String(error?.message || '')
    if (!message.includes('already exists')) {
      throw error
    }
  }
}

const run = async () => {
  const databaseId = process.env.APPWRITE_DATABASE_ID || sdk.ID.unique()
  const subjectsId = process.env.APPWRITE_SUBJECTS_COLLECTION_ID || sdk.ID.unique()
  const tasksId = process.env.APPWRITE_TASKS_COLLECTION_ID || sdk.ID.unique()
  const sessionsId = process.env.APPWRITE_SESSIONS_COLLECTION_ID || sdk.ID.unique()
  const distractionsId = process.env.APPWRITE_DISTRACTIONS_COLLECTION_ID || sdk.ID.unique()
  const bucketId = process.env.APPWRITE_EXPORTS_BUCKET_ID || sdk.ID.unique()

  await ensureDatabase(databaseId, 'StudyFlow')
  await ensureCollection(databaseId, subjectsId, 'subjects')
  await ensureCollection(databaseId, tasksId, 'tasks')
  await ensureCollection(databaseId, sessionsId, 'study_sessions')
  await ensureCollection(databaseId, distractionsId, 'distractions')

  await ensureBucket(bucketId, 'studyflow-exports')

  await ensureAttribute(() => databases.createStringAttribute(databaseId, subjectsId, 'user_id', 64, true))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, subjectsId, 'name', 120, true))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, subjectsId, 'color', 20, true))
  await ensureAttribute(() => databases.createDatetimeAttribute(databaseId, subjectsId, 'created_at', true))

  await ensureAttribute(() => databases.createStringAttribute(databaseId, tasksId, 'user_id', 64, true))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, tasksId, 'subject_id', 64, false))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, tasksId, 'title', 200, true))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, tasksId, 'description', 2000, false))
  await ensureAttribute(() => databases.createBooleanAttribute(databaseId, tasksId, 'completed', true))
  await ensureAttribute(() => databases.createDatetimeAttribute(databaseId, tasksId, 'completed_at', false))
  await ensureAttribute(() => databases.createDatetimeAttribute(databaseId, tasksId, 'due_date', false))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, tasksId, 'priority', 10, false, 'medium'))
  await ensureAttribute(() => databases.createBooleanAttribute(databaseId, tasksId, 'archived', true))
  await ensureAttribute(() => databases.createIntegerAttribute(databaseId, tasksId, 'order', true, 0, 100000))
  await ensureAttribute(() => databases.createDatetimeAttribute(databaseId, tasksId, 'created_at', true))

  await ensureAttribute(() => databases.createStringAttribute(databaseId, sessionsId, 'user_id', 64, true))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, sessionsId, 'subject_id', 64, false))
  await ensureAttribute(() => databases.createIntegerAttribute(databaseId, sessionsId, 'duration', true, 1, 10000))
  await ensureAttribute(() => databases.createDatetimeAttribute(databaseId, sessionsId, 'started_at', true))
  await ensureAttribute(() => databases.createDatetimeAttribute(databaseId, sessionsId, 'completed_at', false))

  await ensureAttribute(() => databases.createStringAttribute(databaseId, distractionsId, 'user_id', 64, true))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, distractionsId, 'session_id', 64, false))
  await ensureAttribute(() => databases.createDatetimeAttribute(databaseId, distractionsId, 'timestamp', true))
  await ensureAttribute(() => databases.createStringAttribute(databaseId, distractionsId, 'type', 20, true))

  console.log('APPWRITE_SETUP_OK')
  console.log(`VITE_APPWRITE_ENDPOINT=${endpoint}`)
  console.log(`VITE_APPWRITE_PROJECT_ID=${projectId}`)
  console.log(`VITE_APPWRITE_DATABASE_ID=${databaseId}`)
  console.log(`VITE_APPWRITE_SUBJECTS_COLLECTION_ID=${subjectsId}`)
  console.log(`VITE_APPWRITE_TASKS_COLLECTION_ID=${tasksId}`)
  console.log(`VITE_APPWRITE_SESSIONS_COLLECTION_ID=${sessionsId}`)
  console.log(`VITE_APPWRITE_DISTRACTIONS_COLLECTION_ID=${distractionsId}`)
  console.log(`VITE_APPWRITE_EXPORTS_BUCKET_ID=${bucketId}`)
}

run().catch((error) => {
  console.error('APPWRITE_SETUP_FAILED')
  console.error(error)
  process.exit(1)
})
