import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Task, Subject } from '@/lib/appwrite'
import { useTaskStore } from '@/store/app-store'
import { GripVertical, Pencil, Trash2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ButtonHTMLAttributes, CSSProperties } from 'react'

interface TaskItemProps {
  task: Task
  subject?: Subject
  onEdit?: () => void
  onDelete?: () => void
  onArchive?: () => void
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>
  style?: CSSProperties
  isDragging?: boolean
}

export function TaskItem({ task, subject, onEdit, onDelete, onArchive, dragHandleProps, style, isDragging }: TaskItemProps) {
  const { toggleTask } = useTaskStore()
  const isOverdue = Boolean(task.due_date && !task.completed && new Date(task.due_date) < new Date())

  const priorityClass =
    task.priority === 'high'
      ? 'bg-red-100 text-red-700 border-red-300'
      : task.priority === 'low'
        ? 'bg-green-100 text-green-700 border-green-300'
        : 'bg-yellow-100 text-yellow-800 border-yellow-300'

  return (
    <div
      style={style}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg border bg-card transition-all',
        isDragging && 'shadow-lg ring-1 ring-primary/30',
        task.completed && 'opacity-60 bg-muted'
      )}
    >
      <button
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => toggleTask(task.id, checked)}
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium truncate',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate">
            {task.description}
          </p>
        )}
        {subject && (
          <div className="flex items-center gap-1 mt-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
            <span className="text-xs text-muted-foreground">{subject.name}</span>
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn('capitalize', priorityClass)}>
            {task.priority || 'medium'}
          </Badge>
          {task.due_date && (
            <Badge variant="outline" className={cn(isOverdue && 'border-red-400 text-red-700')}>
              Due {new Date(task.due_date).toLocaleDateString()}
            </Badge>
          )}
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onArchive} title={task.archived ? 'Unarchive' : 'Archive'}>
          <Archive className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
