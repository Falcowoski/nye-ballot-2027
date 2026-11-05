import { Check, ExternalLink, Star } from 'lucide-react'

import { Avatar } from '@/components/avatar'
import { FirstImpressionsHeader } from '@/components/first-impressions'
import { PhotoCarousel } from '@/components/photo-carousel'
import { PriceBlock } from '@/components/price-block'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { plural } from '@/domain/format'
import { NOTE_AUTHOR_NAME, opinionsFor } from '@/domain/opinions'
import { formatRating, listingSource, VIEW_LISTING_LABEL } from '@/domain/source'
import { compactPicks, requiredPicks } from '@/domain/standings'
import type { Ballot, Picks } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  ballot: Ballot
  index: number
  picks: Picks
  /** The participant already sent a vote, so the review button offers to update it. */
  hasVoted: boolean
  onIndexChange: (index: number) => void
  onPick: (listingId: string, position: number | null) => void
  onOpenReview: () => void
  onOpenList: () => void
  onOpenOpinions: () => void
}

export function HouseScreen({
  ballot,
  index,
  picks,
  hasVoted,
  onIndexChange,
  onPick,
  onOpenReview,
  onOpenList,
  onOpenOpinions,
}: Props) {
  const { listings, participants } = ballot
  const listing = listings[index]
  const total = listings.length
  const slots = requiredPicks(total)
  const myPosition = picks.indexOf(listing.id)
  const suggester = participants.find((p) => p.id === listing.suggestedBy)
  const nameOf = (id: string) => listings.find((l) => l.id === id)?.name ?? ''
  const opinions = opinionsFor(ballot, listing.id)
  const rating = formatRating(listing)
  const participantName = (id: string) => participants.find((p) => p.id === id)?.name ?? '?'
  const isLast = index === total - 1
  const pickCount = compactPicks(picks).length

  const facts = [
    listing.bedrooms != null && plural(listing.bedrooms, 'quarto', 'quartos'),
    listing.beds != null && plural(listing.beds, 'cama', 'camas'),
    listing.bathrooms != null && plural(listing.bathrooms, 'banheiro', 'banheiros'),
    listing.beachAccess,
  ].filter(Boolean) as string[]

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(11.5rem+env(safe-area-inset-bottom))] md:pb-10">
      <header className="sticky top-0 z-20 flex flex-col gap-2 bg-background/95 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 backdrop-blur md:px-8 md:pb-3">
        <div
          aria-hidden="true"
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        >
          {listings.map((l, i) => (
            <span key={l.id} className={cn('h-1 rounded-full', i <= index ? 'bg-primary' : 'bg-border')} />
          ))}
        </div>
        <div className="grid min-h-11 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Button variant="ghost" size="sm" className="-ml-2 justify-self-start" onClick={onOpenList}>
            ‹ Casas
          </Button>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            casa {index + 1} de {total}
          </span>
          <Button variant="outline" size="sm" className="justify-self-end" onClick={onOpenReview}>
            Ranking
          </Button>
        </div>
      </header>

      <div className="md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start md:gap-8 md:px-8 md:pt-2">
        <PhotoCarousel
          key={listing.id}
          photos={listing.photos}
          label={listing.name}
          className="md:sticky md:top-[92px] md:rounded-2xl"
        />

        <div className="md:flex md:flex-col md:gap-5">
          <article className="flex flex-col gap-3 p-4 md:p-0">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-[22px] leading-tight font-bold">{listing.name}</h1>
              <p className="text-[13.5px] text-muted-foreground">{listing.location}</p>
              {suggester && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <Avatar name={suggester.name} size="sm" />
                  Indicada por <b className="font-semibold text-foreground">{suggester.name}</b>
                </p>
              )}
            </div>

            <PriceBlock totalPrice={listing.totalPrice} participants={participants} />

            {(facts.length > 0 || rating) && (
              <ul className="flex flex-wrap gap-1.5">
                {facts.map((fact) => (
                  <li key={fact} className="rounded-full border px-2 py-0.5 text-xs">
                    {fact}
                  </li>
                ))}
                {rating && (
                  <li className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                    {rating.scale === 5 && <Star className="size-3 fill-current" aria-hidden="true" />}
                    {rating.text}
                  </li>
                )}
              </ul>
            )}

            <section aria-label="Análises" className="overflow-hidden rounded-[14px] border">
              {listing.note && (
                <div className="flex flex-col gap-2 p-3.5">
                  <FirstImpressionsHeader authorName={NOTE_AUTHOR_NAME} />
                  <p className="text-sm leading-relaxed">{listing.note}</p>
                </div>
              )}
              <button
                type="button"
                onClick={onOpenOpinions}
                className={cn(
                  'flex min-h-12 w-full items-center justify-between gap-2 bg-muted px-3.5 py-3 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                  listing.note && 'border-t',
                )}
              >
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  {opinions.length > 0 && (
                    <span className="flex shrink-0" aria-hidden="true">
                      {opinions.slice(0, 3).map((o, i) => (
                        <Avatar
                          key={o.participantId}
                          name={participantName(o.participantId)}
                          size="sm"
                          className={cn('ring-2 ring-muted', i > 0 && '-ml-2')}
                        />
                      ))}
                    </span>
                  )}
                  Mais análises · {opinions.length}
                </span>
                <span className="shrink-0 text-[13px] font-semibold text-primary">
                  {opinions.length > 0 ? 'Ver e escrever ›' : 'Escrever ›'}
                </span>
              </button>
            </section>

            {listing.highlights?.length > 0 && (
              <section aria-labelledby="highlights-title" className="flex flex-col gap-1.5">
                <h2
                  id="highlights-title"
                  className="text-[11.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
                >
                  Do anúncio
                </h2>
                <ul className="flex flex-col gap-1 text-sm">
                  {listing.highlights.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {listing.url && (
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-[14px] border p-3.5 outline-none transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold">{VIEW_LISTING_LABEL[listingSource(listing.url)]}</span>
                  <span className="text-[13px] text-muted-foreground">
                    Todas as fotos, detalhes e avaliações de outros hóspedes
                  </span>
                </span>
                <ExternalLink className="size-5 shrink-0 text-primary" aria-hidden="true" />
              </a>
            )}
          </article>

          <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] flex-col gap-2.5 border-t bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:mx-0 md:max-w-none md:rounded-2xl md:border md:bg-muted md:p-4">
            <p id="position-label" className="text-[13px] font-semibold text-muted-foreground">
              Em que posição essa fica?
            </p>
            <ToggleGroup
              type="single"
              aria-labelledby="position-label"
              value={myPosition >= 0 ? String(myPosition) : ''}
              onValueChange={(value) => onPick(listing.id, value === '' ? null : Number(value))}
              style={{ gridTemplateColumns: `repeat(${slots}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: slots }, (_, position) => {
                const holder = picks[position]
                const takenByOther = !!holder && holder !== listing.id
                const sub = holder === listing.id ? 'esta casa' : holder ? nameOf(holder) : 'livre'
                return (
                  <ToggleGroupItem
                    key={position}
                    value={String(position)}
                    className={cn(
                      'h-[60px]',
                      takenByOther && 'border-dashed border-border-strong bg-muted text-muted-foreground',
                    )}
                  >
                    <span className="text-[17px] font-bold">{position + 1}º</span>
                    <span className="max-w-full truncate text-[11.5px]">{sub}</span>
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Button
                variant="ghost"
                className="justify-self-start px-3"
                disabled={index === 0}
                onClick={() => onIndexChange(index - 1)}
              >
                ‹ Anterior
              </Button>
              {pickCount > 0 ? (
                <Button variant="outline" size="sm" onClick={onOpenReview}>
                  {hasVoted ? 'Atualizar voto' : 'Revisar voto'} · {pickCount}
                </Button>
              ) : (
                <span />
              )}
              <Button
                variant="ghost"
                className="justify-self-end px-3"
                disabled={isLast}
                onClick={() => onIndexChange(index + 1)}
              >
                Próxima ›
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
