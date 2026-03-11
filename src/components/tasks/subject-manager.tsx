import { useState } from 'react'
import { useTaskStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'

export function SubjectManager() {
  const { subjects, addSubject, deleteSubject } = useTaskStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1')

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return
    addSubject({
      name: newSubjectName,
      color: newSubjectColor,
    })
    setNewSubjectName('')
    setNewSubjectColor('#6366f1')
    setIsDialogOpen(false)
  }

  const handleDeleteSubject = (id: string) => {
    if (confirm('Delete this subject? Tasks will be unassigned.')) {
      deleteSubject(id)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Subjects</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject Name</label>
                <Input
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <Input
                    value={newSubjectColor}
                    onChange={(e) => setNewSubjectColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubject}>Add Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border"
            style={{
              backgroundColor: `${subject.color}15`,
              borderColor: subject.color,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
            <span className="font-medium">{subject.name}</span>
            <button
              onClick={() => handleDeleteSubject(subject.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {subjects.length === 0 && (
          <p className="text-sm text-muted-foreground">No subjects yet. Add one to get started!</p>
        )}
      </div>
    </div>
  )
}
