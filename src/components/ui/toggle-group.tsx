import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import * as React from 'react'

import { cn } from '@/lib/utils'

function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn('grid gap-2', className)} {...props} />
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'flex min-w-0 cursor-pointer flex-col items-center justify-center gap-px rounded-lg border border-border bg-background px-1.5 outline-none transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
