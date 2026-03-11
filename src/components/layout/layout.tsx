import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileMenu } from './mobile-menu'
import { ShortcutsHelpModal } from './shortcuts-help-modal'
import { SettingsDialog } from './settings-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useTheme } from '@/hooks/use-theme'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  useKeyboardShortcuts([
    { key: '1', ctrl: true, action: () => navigate('/') },
    { key: '2', ctrl: true, action: () => navigate('/timer') },
    { key: '3', ctrl: true, action: () => navigate('/tasks') },
    { key: '4', ctrl: true, action: () => navigate('/analytics') },
    {
      key: 'k',
      ctrl: true,
      action: () => setMobileMenuOpen((open) => !open),
    },
    {
      key: 'j',
      ctrl: true,
      action: () =>
        setTheme(
          theme === 'light' ? 'dark' : 'light'
        ),
    },
    {
      key: '?',
      action: () => setShortcutsOpen(true),
    },
    {
      key: ',',
      ctrl: true,
      action: () => setSettingsOpen(true),
    },
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex">
        <Sidebar
          className="hidden md:block"
          onItemClick={() => setMobileMenuOpen(false)}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        <ShortcutsHelpModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        <ScrollArea className="w-full">
          <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6">{children}</main>
        </ScrollArea>
      </div>
    </div>
  )
}
