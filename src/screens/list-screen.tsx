import { ImageOff, MessageSquare } from 'lucide-react'

import { ParticipantBadge } from '@/components/participant-badge'
import { Button } from '@/components/ui/button'
import { formatBrl, plural } from '@/domain/format'
import { analysisCount } from '@/domain/opinions'
import { splitPrice } from '@/domain/pricing'
import { requiredPicks } from '@/domain/standings'
import type { Ballot, Participant, Picks } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  ballot: Ballot
  participant: Participant
  picks: Picks
  /** The participant already sent a vote, so the review button offers to update it. */
  hasVoted: boolean
  onOpenListing: (index: number) => void
  onOpenReview: () => void
  onSignOut: () => void
}

export function ListScreen({ ballot, participant, picks, hasVoted, onOpenListing, onOpenReview, onSignOut }: Props) {
  const { listings, participants } = ballot
  const slots = requiredPicks(listings.length)
  const nameOf = (id: string | null) => listings.find((l) => l.id === id)?.name

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-background/95 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 backdrop-blur md:px-8 md:pb-3">
        <ParticipantBadge participant={participant} onSignOut={onSignOut} />
        <Button variant="outline" size="sm" onClick={onOpenReview}>
          Ranking
        </Button>
      </header>

      <main className="flex flex-col gap-4 px-4 pt-2 md:px-8">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-[22px] font-bold">Casas</h1>
          <span className="text-[13px] text-muted-foreground">{plural(listings.length, 'opção', 'opções')}</span>
        </div>

        <ul className="grid gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {listings.map((listing, index) => {
            const position = picks.indexOf(listing.id)
            const split = listing.totalPrice ? splitPrice(listing.totalPrice, participants) : null
            const analyses = analysisCount(ballot, listing)
            const facts = [
              listing.bedrooms != null && plural(listing.bedrooms, 'quarto', 'quartos'),
              listing.beds != null && plural(listing.beds, 'cama', 'camas'),
              listing.beachAccess,
            ].filter(Boolean)
            return (
              <li key={listing.id} className="flex">
                <button
                  type="button"
                  onClick={() => onOpenListing(index)}
                  className={cn(
                    'flex h-full w-full gap-3 overflow-hidden rounded-[14px] border bg-background p-2 text-left outline-none transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:flex-col md:gap-0 md:p-0',
                    position >= 0 && 'border-primary ring-1 ring-primary',
                  )}
                >
                  <span className="relative block w-28 shrink-0 overflow-hidden rounded-[10px] md:w-full md:rounded-none">
                    {listing.photos[0] ? (
                      <img
                        src={listing.photos[0]}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="aspect-[4/3] h-full w-full bg-placeholder object-cover"
                      />
                    ) : (
                      <span className="grid aspect-[4/3] h-full w-full place-items-center bg-placeholder text-muted-foreground">
                        <ImageOff className="size-5" aria-hidden="true" />
                      </span>
                    )}
                    {position >= 0 && (
                      <span className="absolute top-1.5 left-1.5 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground md:top-3 md:left-3 md:px-2.5 md:text-sm">
                        Seu {position + 1}º
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-1 pr-1 md:justify-start md:p-4">
                    <span className="line-clamp-2 text-[15px] leading-snug font-semibold md:text-[17px]">
                      {listing.name}
                    </span>
                    <span className="truncate text-[12.5px] text-muted-foreground">{listing.location}</span>
                    <span className="mt-1 text-[17px] font-bold tabular-nums">
                      {split ? (
                        <>
                          ≈ {formatBrl(split.fullStay)}{' '}
                          <span className="text-xs font-medium text-muted-foreground">/pessoa</span>
                        </>
                      ) : (
                        <span className="text-sm">Preço a confirmar</span>
                      )}
                    </span>
                    {facts.length > 0 && (
                      <span className="truncate text-xs text-muted-foreground">{facts.join(' · ')}</span>
                    )}
                    {analyses > 0 && (
                      <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-primary md:mt-auto md:pt-2">
                        <MessageSquare className="size-3.5" aria-hidden="true" />
                        {plural(analyses, 'análise', 'análises')}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] flex-col gap-2.5 border-t bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:max-w-[1120px] md:flex-row md:items-center md:px-8">
        <ol className="flex min-w-0 flex-1 gap-1.5" aria-label="Seu top 3">
          {Array.from({ length: slots }, (_, i) => {
            const name = nameOf(picks[i])
            return (
              <li
                key={i}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[13px]',
                  name ? 'border-primary bg-accent' : 'border-dashed border-border-strong text-muted-foreground',
                )}
              >
                <b className={name ? 'text-primary' : undefined}>{i + 1}º</b>
                <span className="truncate">{name ?? '—'}</span>
              </li>
            )
          })}
        </ol>
        <Button onClick={onOpenReview} className="md:w-48">
          {hasVoted ? 'Atualizar voto' : 'Revisar voto'}
        </Button>
      </div>
    </div>
  )
}
