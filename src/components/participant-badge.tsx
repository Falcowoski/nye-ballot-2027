import { LogOut } from 'lucide-react'

import { Avatar } from '@/components/avatar'
import type { Participant } from '@/domain/types'

/** Who is voting, with a way out for a wrong pick or a shared phone. */
export function ParticipantBadge({ participant, onSignOut }: { participant: Participant; onSignOut: () => void }) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <Avatar name={participant.name} />
        <span className="truncate">{participant.name}</span>
      </span>
      <button
        type="button"
        onClick={onSignOut}
        aria-label={`Sair da conta de ${participant.name}`}
        title="Sair"
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  )
}
