import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { useProgressStore } from '@/store/app-store'
import { getLevelFromXp } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { xp } = useProgressStore()
  const { configured, user, signOut } = useAuth()
  const level = getLevelFromXp(xp)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">SF</span>
          </div>
          <span className="font-semibold">StudyFlow</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
            Lv {level} • {xp} XP
          </div>
          <span className="hidden lg:inline text-xs text-muted-foreground">
            Ctrl+1..4 navigate, Ctrl+K menu
          </span>
          {configured && user && (
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
