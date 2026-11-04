import { Avatar } from '@/components/avatar'

/** Author line for the listing's first-impression note. */
export function FirstImpressionsHeader({ authorName }: { authorName: string }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold">
      <Avatar name={authorName} size="sm" />
      {authorName}
      <span className="rounded-full bg-accent px-2 py-0.5 text-[11.5px] text-accent-foreground">
        Primeiras impressões
      </span>
    </span>
  )
}
