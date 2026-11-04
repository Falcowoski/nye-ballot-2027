import { initials } from '@/domain/format'
import { cn } from '@/lib/utils'

const sizes = {
  sm: 'size-[22px] text-[10px]',
  md: 'size-[30px] text-xs',
  lg: 'size-10 text-sm',
}

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: keyof typeof sizes
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-accent font-bold text-accent-foreground',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
