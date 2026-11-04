import { useState } from 'react'

import { Avatar } from '@/components/avatar'
import { FirstImpressionsHeader } from '@/components/first-impressions'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/domain/format'
import { NOTE_AUTHOR_NAME, OPINION_MAX_LENGTH, opinionsFor } from '@/domain/opinions'
import type { Ballot, Listing, Participant } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  ballot: Ballot
  participant: Participant
  listing: Listing
  saving: boolean
  onBack: () => void
  onSave: (body: string) => void
}

export function OpinionsScreen({ ballot, participant, listing, saving, onBack, onSave }: Props) {
  const opinions = opinionsFor(ballot, listing.id)
  const mine = opinions.find((o) => o.participantId === participant.id)
  const [draft, setDraft] = useState(mine?.body ?? '')
  const nameOf = (id: string) => ballot.participants.find((p) => p.id === id)?.name ?? 'Alguém'

  const trimmed = draft.trim()
  const unchanged = !!mine && trimmed === mine.body
  const submitLabel = saving
    ? 'Salvando…'
    : unchanged
      ? 'Análise publicada'
      : mine
        ? 'Salvar alterações'
        : 'Publicar análise'

  return (
    <div className="flex min-h-dvh flex-col bg-muted pb-[calc(17rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex flex-col gap-0.5 border-b bg-background px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-3">
        <Button variant="ghost" size="sm" className="-ml-2 self-start" onClick={onBack}>
          ‹ Casa
        </Button>
        <h1 className="text-[22px] font-bold">Análises</h1>
        <p className="text-[13px] text-muted-foreground">{listing.name}</p>
      </header>

      <main className="flex flex-col gap-3 px-4 pt-4">
        {listing.note && (
          <article className="flex flex-col gap-2 rounded-[14px] border border-primary bg-background p-3.5">
            <FirstImpressionsHeader authorName={NOTE_AUTHOR_NAME} />
            <p className="text-sm leading-relaxed">{listing.note}</p>
          </article>
        )}

        <h2 className="mt-1 text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Mais análises · {opinions.length}
        </h2>

        {opinions.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted-foreground">
            Ninguém escreveu sobre essa casa ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {opinions.map((o) => {
              const isMine = o.participantId === participant.id
              const name = nameOf(o.participantId)
              return (
                <li
                  key={o.participantId}
                  className={cn(
                    'flex flex-col gap-2 rounded-[14px] border bg-background p-3.5',
                    isMine && 'border-primary/50',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                      <Avatar name={name} />
                      <span className="truncate">{name}</span>
                      {isMine && <span className="font-normal text-muted-foreground">(você)</span>}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(o.updatedAt)}</span>
                  </span>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{o.body}</p>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <form
        className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] flex-col gap-2 border-t bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
        onSubmit={(event) => {
          event.preventDefault()
          if (trimmed && !unchanged && !saving) onSave(trimmed)
        }}
      >
        <label htmlFor="opinion-body" className="text-[13px] font-semibold">
          Sua análise
        </label>
        <textarea
          id="opinion-body"
          rows={3}
          maxLength={OPINION_MAX_LENGTH}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="O que você achou dessa casa?"
          className="w-full resize-none rounded-xl border bg-muted px-3 py-2.5 text-[15px] outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Uma por casa. Dá para editar depois.</span>
          <span className="tabular-nums">
            {draft.length}/{OPINION_MAX_LENGTH}
          </span>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={!trimmed || unchanged || saving}>
          {submitLabel}
        </Button>
        {mine && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-center text-muted-foreground"
            disabled={saving}
            onClick={() => {
              setDraft('')
              onSave('')
            }}
          >
            Apagar minha análise
          </Button>
        )}
      </form>
    </div>
  )
}
