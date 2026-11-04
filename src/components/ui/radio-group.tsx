import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'

import { cn } from '@/lib/utils'

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn('grid gap-2', className)} {...props} />
}

/** A radio rendered as a selectable card (no dot indicator). */
function RadioGroupCard({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-card"
      className={cn(
        'flex min-w-0 flex-col items-start justify-center rounded-lg border border-border bg-background px-3.5 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground disabled:cursor-not-allowed disabled:border-dashed disabled:border-border-strong disabled:bg-muted disabled:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { RadioGroup, RadioGroupCard }
