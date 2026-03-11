import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof checkboxVariants> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(checkboxVariants({ variant, className }))}
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants }
