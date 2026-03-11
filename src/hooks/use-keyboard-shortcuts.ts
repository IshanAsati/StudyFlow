import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName.toLowerCase()
      return (
        target.isContentEditable ||
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select'
      )
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      shortcuts.forEach(({ key, ctrl, meta, shift, alt, action }) => {
        const wantsCtrlOrMeta = Boolean(ctrl)
        const match =
          e.key.toLowerCase() === key.toLowerCase() &&
          (wantsCtrlOrMeta ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey) &&
          (typeof meta === 'boolean' ? meta === e.metaKey : true) &&
          (typeof shift === 'boolean' ? shift === e.shiftKey : true) &&
          (typeof alt === 'boolean' ? alt === e.altKey : true)

        if (match) {
          e.preventDefault()
          action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
