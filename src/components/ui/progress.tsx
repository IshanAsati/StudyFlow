import { cn } from '@/lib/utils'
import { Progress as RadixProgress } from '@radix-ui/react-progress'
import { forwardRef } from 'react'

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof RadixProgress> {}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => (
    <RadixProgress
      ref={ref}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </RadixProgress>
  )
)
Progress.displayName = 'Progress'

export { Progress }
