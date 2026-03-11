import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BarChart3,
  Settings,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/timer', label: 'Timer', icon: Timer },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

interface SidebarProps {
  className?: string
  onItemClick?: () => void
  onSettingsClick?: () => void
}

export function Sidebar({ className, onItemClick, onSettingsClick }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className={cn('w-64 border-r bg-muted/40 min-h-[calc(100vh-3.5rem)]', className)}>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto p-4 border-t">
        <button
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          onClick={onSettingsClick}
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </div>
    </aside>
  )
}
