import { ArrowDown, ArrowUp, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatBrl, formatDateTime } from '@/domain/format'
import { splitPrice } from '@/domain/pricing'
import { isComplete, requiredPicks, samePicks, type Standing } from '@/domain/standings'
import type { Ballot, Participant, Picks } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  ballot: Ballot
  standings: Standing[]
  participant: Participant | null
  picks: Picks
  submitting: boolean
  onMove: (from: number, to: number) => void
  onChoose: () => void
  onSubmit: () => void
  onBack: () => void
  onChangePerson: () => void
  onOpenStanding: (listingId: string) => void
}

export function ReviewScreen({
  ballot,
  standings,
  participant,
  picks,
  submitting,
  onMove,
  onChoose,
  onSubmit,
  onBack,
  onChangePerson,
  onOpenStanding,
}: Props) {
  const { listings, participants, votes } = ballot
  const slots = requiredPicks(listings.length)
  const myVote = participant ? votes.find((v) => v.participantId === participant.id) : undefined
  const complete = isComplete(picks, listings.length)
  const unchanged = samePicks(picks.slice(0, slots), myVote?.ranking)
  const votedIds = new Set(votes.map((v) => v.participantId))
  const votedCount = participants.filter((p) => votedIds.has(p.id)).length
  const maxPoints = Math.max(1, standings[0]?.points ?? 0)

  const priceOf = (totalPrice: number | null) => {
    const split = totalPrice ? splitPrice(totalPrice, participants) : null
    return split ? `≈ ${formatBrl(split.fullStay)} /pessoa` : 'Preço a confirmar'
  }

  const submitLabel = submitting
    ? 'Enviando…'
    : !complete
      ? `Escolha ${slots} casas`
      : myVote && unchanged
        ? 'Voto enviado'
        : myVote
          ? 'Atualizar voto'
          : 'Enviar voto'

  return (
    <div className="flex min-h-dvh flex-col gap-5 bg-muted px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:px-8 md:pt-6">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          ‹ {participant ? 'Casas' : 'Voltar'}
        </Button>
        <span className="text-sm font-semibold">Réveillon 2027 🍻</span>
      </header>

      <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start md:gap-6">
        {participant && (
          <section
            aria-labelledby="mine-title"
            className="flex flex-col gap-3 rounded-2xl border bg-background p-4 md:sticky md:top-6"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h1 id="mine-title" className="text-xl font-bold">
                Seu top 3
              </h1>
              <span className="text-[13px] text-muted-foreground">
                votando como{' '}
                <button
                  type="button"
                  onClick={onChangePerson}
                  className="font-semibold text-foreground underline-offset-2 outline-none hover:underline focus-visible:underline"
                >
                  {participant.name}
                </button>
              </span>
            </div>

            <ol className="flex flex-col gap-2">
              {Array.from({ length: slots }, (_, i) => {
                const listing = listings.find((l) => l.id === picks[i])
                if (!listing) {
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={onChoose}
                        className="flex h-[60px] w-full items-center gap-2.5 rounded-lg border border-dashed border-border-strong px-3 text-left text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                      >
                        <span className="w-[26px] text-[17px] font-bold">{i + 1}º</span>
                        <span className="text-sm">Escolher casa</span>
                      </button>
                    </li>
                  )
                }
                return (
                  <li key={listing.id} className="flex items-center gap-2.5 rounded-lg border py-2 pr-2 pl-3">
                    <span className="w-[26px] text-[17px] font-bold text-primary">{i + 1}º</span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[15px] font-semibold">{listing.name}</span>
                      <span className="text-[12.5px] text-muted-foreground tabular-nums">
                        {priceOf(listing.totalPrice)}
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-[10px]"
                      aria-label={`Subir ${listing.name}`}
                      disabled={i === 0}
                      onClick={() => onMove(i, i - 1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-[10px]"
                      aria-label={`Descer ${listing.name}`}
                      disabled={i === slots - 1}
                      onClick={() => onMove(i, i + 1)}
                    >
                      <ArrowDown />
                    </Button>
                  </li>
                )
              })}
            </ol>

            <Button size="lg" disabled={!complete || submitting || (!!myVote && unchanged)} onClick={onSubmit}>
              {myVote && unchanged && !submitting && <Check />}
              {submitLabel}
            </Button>
            {myVote && (
              <p className="text-center text-xs text-muted-foreground">
                Último voto em {formatDateTime(myVote.updatedAt)}. Você pode trocar quando quiser.
              </p>
            )}
          </section>
        )}

        <section
          aria-labelledby="ranking-title"
          className={cn('flex flex-col gap-2.5', !participant && 'md:col-span-2 md:mx-auto md:w-full md:max-w-[640px]')}
        >
          <div className="flex items-baseline justify-between px-0.5">
            <h2 id="ranking-title" className="text-xl font-bold">
              Ranking
            </h2>
            <span className="text-[13px] text-muted-foreground">
              {votedCount} de {participants.length} votaram
            </span>
          </div>

          <ol className="flex flex-col gap-2.5">
            {standings.map((s, i) => (
              <li key={s.listing.id}>
                <button
                  type="button"
                  onClick={() => onOpenStanding(s.listing.id)}
                  className="grid w-full grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 rounded-[14px] border bg-background px-3.5 py-3 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  <span
                    className={cn(
                      'text-lg font-bold tabular-nums',
                      i === 0 && s.points > 0 ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate text-[15px] font-semibold">{s.listing.name}</span>
                  <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                    <b className="text-base text-foreground tabular-nums">{s.points}</b> pts ›
                  </span>
                  <span className="col-start-2 col-end-4 h-[5px] overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${(s.points / maxPoints) * 100}%` }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <p className="px-0.5 text-[12.5px] text-muted-foreground">
            1º lugar vale 3 pontos, 2º vale 2 e 3º vale 1. No empate, ganha quem tem mais votos em 1º.
          </p>
        </section>
      </div>
    </div>
  )
}
