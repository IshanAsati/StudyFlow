import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ShortcutsHelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  { keys: 'Ctrl/Cmd + 1', action: 'Go to Dashboard' },
  { keys: 'Ctrl/Cmd + 2', action: 'Go to Timer' },
  { keys: 'Ctrl/Cmd + 3', action: 'Go to Tasks' },
  { keys: 'Ctrl/Cmd + 4', action: 'Go to Analytics' },
  { keys: 'Ctrl/Cmd + K', action: 'Toggle mobile menu' },
  { keys: 'Ctrl/Cmd + J', action: 'Toggle theme' },
  { keys: 'Ctrl/Cmd + ,', action: 'Open settings' },
  { keys: '?', action: 'Open this shortcuts help' },
  { keys: 'Space', action: 'Start/Pause timer' },
  { keys: 'R', action: 'Reset timer' },
  { keys: 'N', action: 'Skip to next timer mode' },
  { keys: 'F', action: 'Switch timer to Focus mode' },
  { keys: 'B', action: 'Switch timer to Break mode' },
  { keys: 'L', action: 'Switch timer to Long Break mode' },
]

export function ShortcutsHelpModal({ open, onOpenChange }: ShortcutsHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.keys}
              className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2"
            >
              <span className="text-sm text-muted-foreground">{shortcut.action}</span>
              <kbd className="rounded border bg-background px-2 py-1 text-xs font-medium">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
