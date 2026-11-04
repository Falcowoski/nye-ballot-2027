import { Star } from 'lucide-react'

import { Avatar } from '@/components/avatar'
import { PhotoCarousel } from '@/components/photo-carousel'
import { PriceBlock } from '@/components/price-block'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatDecimal, plural } from '@/domain/format'
import { requiredPicks } from '@/domain/standings'
import type { Ballot, Participant, Picks } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  ballot: Ballot
  participant: Participant
  index: number
  picks: Picks
  onIndexChange: (index: number) => void
  onPick: (listingId: string, position: number | null) => void
  onOpenReview: () => void
  onChangePerson: () => void
}

export function HouseScreen({ ballot, participant, index, picks, onIndexChange, onPick, onOpenReview, onChangePerson }: Props) {
  const { listings, participants } = ballot
  const listing = listings[index]
  const total = listings.length
  const slots = requiredPicks(total)
  const myPosition = picks.indexOf(listing.id)
  const suggester = participants.find((p) => p.id === listing.suggestedBy)
  const nameOf = (id: string) => listings.find((l) => l.id === id)?.name ?? ''
  const isLast = index === total - 1

  const facts = [
    listing.bedrooms != null && plural(listing.bedrooms, 'quarto', 'quartos'),
    listing.beds != null && plural(listing.beds, 'cama', 'camas'),
    listing.bathrooms != null && plural(listing.bathrooms, 'banheiro', 'banheiros'),
    listing.beachAccess,
  ].filter(Boolean) as string[]

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(11.5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex flex-col gap-2 bg-background/95 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 backdrop-blur">
        <div aria-hidden="true" className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {listings.map((l, i) => (
            <span key={l.id} className={cn('h-1 rounded-full', i <= index ? 'bg-primary' : 'bg-border')} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onChangePerson}
            className="flex min-h-11 min-w-0 items-center gap-2 rounded-md text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            aria-label={`Votando como ${participant.name}. Trocar pessoa`}
          >
            <Avatar name={participant.name} />
            <span className="truncate">{participant.name}</span>
            <span className="shrink-0 font-normal text-muted-foreground">
              · casa {index + 1} de {total}
            </span>
          </button>
          <Button variant="outline" size="sm" onClick={onOpenReview}>
            Ranking
          </Button>
        </div>
      </header>

      <PhotoCarousel key={listing.id} photos={listing.photos} label={listing.name} />

      <article className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[22px] leading-tight font-bold">{listing.name}</h1>
          <p className="text-[13.5px] text-muted-foreground">
            {listing.location}
            {listing.airbnbUrl && (
              <>
                {' · '}
                <a
                  href={listing.airbnbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:text-foreground hover:underline"
                >
                  Airbnb ↗
                </a>
              </>
            )}
          </p>
          {suggester && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Avatar name={suggester.name} size="sm" />
              Indicada por <b className="font-semibold text-foreground">{suggester.name}</b>
            </p>
          )}
        </div>

        <PriceBlock totalPrice={listing.totalPrice} participants={participants} />

        {(facts.length > 0 || listing.rating != null) && (
          <ul className="flex flex-wrap gap-1.5">
            {facts.map((fact) => (
              <li key={fact} className="rounded-full border px-2 py-0.5 text-xs">
                {fact}
              </li>
            ))}
            {listing.rating != null && (
              <li className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                <Star className="size-3 fill-current" aria-hidden="true" />
                {formatDecimal(listing.rating)}
                {listing.reviewCount != null && <span className="text-muted-foreground">({listing.reviewCount})</span>}
              </li>
            )}
          </ul>
        )}

        {listing.note && (
          <p className="text-sm leading-relaxed">
            <b className="font-semibold">Análise:</b> {listing.note}
          </p>
        )}
      </article>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] flex-col gap-2.5 border-t bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
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
                className={cn('h-[60px]', takenByOther && 'border-dashed border-border-strong bg-muted text-muted-foreground')}
              >
                <span className="text-[17px] font-bold">{position + 1}º</span>
                <span className="max-w-full truncate text-[11.5px]">{sub}</span>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
        <div className="flex justify-between">
          <Button variant="ghost" className="px-2" disabled={index === 0} onClick={() => onIndexChange(index - 1)}>
            ‹ Anterior
          </Button>
          {isLast ? (
            <Button variant="ghost" className="px-2" onClick={onOpenReview}>
              Revisar voto ›
            </Button>
          ) : (
            <Button variant="ghost" className="px-2" onClick={() => onIndexChange(index + 1)}>
              Próxima ›
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
