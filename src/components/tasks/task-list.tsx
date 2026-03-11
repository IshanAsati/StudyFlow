import { useMemo, useState } from 'react'
import { useTaskStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Archive } from 'lucide-react'
import { TaskItem } from './task-item'
import { SubjectManager } from './subject-manager'
import { cn } from '@/lib/utils'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, Subject } from '@/lib/appwrite'

interface TaskListProps {
  subjectFilter?: string | null
}

type Priority = 'low' | 'medium' | 'high'
type StatusFilter = 'all' | 'active' | 'completed' | 'overdue'

export function TaskList({ subjectFilter }: TaskListProps) {
  const {
    tasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    selectedSubject,
    setSelectedSubject,
  } = useTaskStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showArchived, setShowArchived] = useState(false)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskSubject, setNewTaskSubject] = useState<string | null>(null)
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium')

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [editTaskSubject, setEditTaskSubject] = useState<string | null>(null)
  const [editTaskDueDate, setEditTaskDueDate] = useState('')
  const [editTaskPriority, setEditTaskPriority] = useState<Priority>('medium')

  const sensors = useSensors(useSensor(PointerSensor))

  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.order - b.order), [tasks])

  const activeFilter = subjectFilter ?? selectedSubject

  const filteredTasks = useMemo(() => {
    const now = new Date()
    return sortedTasks
      .filter((task) => (activeFilter ? task.subject_id === activeFilter : true))
      .filter((task) => (showArchived ? task.archived : !task.archived))
      .filter((task) =>
        searchQuery.trim()
          ? task.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            (task.description || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
          : true
      )
      .filter((task) => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'active') return !task.completed
        if (statusFilter === 'completed') return task.completed
        if (statusFilter === 'overdue') {
          return Boolean(task.due_date && !task.completed && new Date(task.due_date) < now)
        }
        return true
      })
  }, [sortedTasks, activeFilter, showArchived, searchQuery, statusFilter])

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    addTask({
      title: newTaskTitle,
      description: newTaskDescription || null,
      subject_id: newTaskSubject,
      due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
      priority: newTaskPriority,
    })
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskSubject(null)
    setNewTaskDueDate('')
    setNewTaskPriority('medium')
    setIsDialogOpen(false)
  }

  const openEditDialog = (task: Task) => {
    setEditingTaskId(task.id)
    setEditTaskTitle(task.title)
    setEditTaskDescription(task.description || '')
    setEditTaskSubject(task.subject_id)
    setEditTaskDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '')
    setEditTaskPriority(task.priority || 'medium')
    setIsEditDialogOpen(true)
  }

  const handleSaveTaskEdit = () => {
    if (!editingTaskId || !editTaskTitle.trim()) return

    updateTask(editingTaskId, {
      title: editTaskTitle,
      description: editTaskDescription || null,
      subject_id: editTaskSubject,
      due_date: editTaskDueDate ? new Date(editTaskDueDate).toISOString() : null,
      priority: editTaskPriority,
    })
    setIsEditDialogOpen(false)
    setEditingTaskId(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const targetIndex = sortedTasks.findIndex((task) => task.id === over.id)
    if (targetIndex === -1) return

    reorderTasks(String(active.id), targetIndex)
  }

  return (
    <div className="space-y-4">
      <SubjectManager />

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h3 className="font-medium">Tasks</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showArchived ? 'secondary' : 'outline'}
            onClick={() => setShowArchived((value) => !value)}
          >
            <Archive className="h-4 w-4 mr-1" />
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <TaskFormFields
                subjects={subjects}
                title={newTaskTitle}
                description={newTaskDescription}
                subjectId={newTaskSubject}
                dueDate={newTaskDueDate}
                priority={newTaskPriority}
                onTitleChange={setNewTaskTitle}
                onDescriptionChange={setNewTaskDescription}
                onSubjectChange={setNewTaskSubject}
                onDueDateChange={setNewTaskDueDate}
                onPriorityChange={setNewTaskPriority}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskFormFields
            subjects={subjects}
            title={editTaskTitle}
            description={editTaskDescription}
            subjectId={editTaskSubject}
            dueDate={editTaskDueDate}
            priority={editTaskPriority}
            onTitleChange={setEditTaskTitle}
            onDescriptionChange={setEditTaskDescription}
            onSubjectChange={setEditTaskSubject}
            onDueDateChange={setEditTaskDueDate}
            onPriorityChange={setEditTaskPriority}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTaskEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'completed', 'overdue'] as const).map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'px-3 py-1 rounded-full text-sm whitespace-nowrap border transition-colors capitalize',
                statusFilter === filter ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSubject(null)}
            className={cn(
              'px-3 py-1 rounded-full text-sm whitespace-nowrap border transition-colors',
              selectedSubject === null ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            All
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={cn(
                'px-3 py-1 rounded-full text-sm whitespace-nowrap border transition-colors',
                selectedSubject === subject.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              style={{
                backgroundColor: selectedSubject === subject.id ? undefined : `${subject.color}15`,
                borderColor: subject.color,
              }}
            >
              {subject.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {filteredTasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subject_id)
              return (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  subject={subject}
                  onEdit={() => openEditDialog(task)}
                  onDelete={() => {
                    if (confirm('Delete this task?')) {
                      deleteTask(task.id)
                    }
                  }}
                  onArchive={() => updateTask(task.id, { archived: !task.archived })}
                />
              )
            })}
          </SortableContext>
        </DndContext>
        {filteredTasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tasks match your filters.
          </p>
        )}
      </div>
    </div>
  )
}

function TaskFormFields({
  subjects,
  title,
  description,
  subjectId,
  dueDate,
  priority,
  onTitleChange,
  onDescriptionChange,
  onSubjectChange,
  onDueDateChange,
  onPriorityChange,
}: {
  subjects: Subject[]
  title: string
  description: string
  subjectId: string | null
  dueDate: string
  priority: Priority
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSubjectChange: (value: string | null) => void
  onDueDateChange: (value: string) => void
  onPriorityChange: (value: Priority) => void
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="e.g., Complete Chapter 5" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Optional description..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Due Date (optional)</label>
        <Input type="date" value={dueDate} onChange={(e) => onDueDateChange(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Priority</label>
        <div className="flex flex-wrap gap-2">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              type="button"
              key={level}
              onClick={() => onPriorityChange(level)}
              className={cn(
                'px-3 py-1 rounded-full text-sm border transition-colors capitalize',
                priority === level ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject (optional)</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSubjectChange(null)}
            className={cn(
              'px-3 py-1 rounded-full text-sm border',
              subjectId === null ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            None
          </button>
          {subjects.map((subject) => (
            <button
              type="button"
              key={subject.id}
              onClick={() => onSubjectChange(subject.id)}
              className={cn(
                'px-3 py-1 rounded-full text-sm border',
                subjectId === subject.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              style={{
                backgroundColor: subjectId === subject.id ? undefined : `${subject.color}15`,
                borderColor: subject.color,
              }}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SortableTaskItem({
  task,
  subject,
  onEdit,
  onDelete,
  onArchive,
}: {
  task: Task
  subject?: Subject
  onEdit: () => void
  onDelete: () => void
  onArchive: () => void
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div ref={setNodeRef}>
      <TaskItem
        task={task}
        subject={subject}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={onArchive}
        dragHandleProps={{ ...attributes, ...listeners }}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        isDragging={isDragging}
      />
    </div>
  )
}
