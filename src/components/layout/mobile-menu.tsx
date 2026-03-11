import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/timer', label: 'Timer', icon: Timer },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onSettingsClick?: () => void
}

export function MobileMenu({ isOpen, onClose, onSettingsClick }: MobileMenuProps) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 left-0 w-[82vw] max-w-72 bg-background border-r shadow-lg p-4"
            initial={{ x: -24, opacity: 0.7 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0.7 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-semibold">StudyFlow</span>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
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
            <div className="mt-8 border-t pt-4">
              <button
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
                onClick={() => {
                  onClose()
                  onSettingsClick?.()
                }}
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
