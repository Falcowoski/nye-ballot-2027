import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupCard } from '@/components/ui/radio-group'
import { plural } from '@/domain/format'
import type { Ballot } from '@/domain/types'
import { cn } from '@/lib/utils'

type Props = {
  ballot: Ballot
  participantId: string | null
  onSelect: (participantId: string) => void
  onContinue: () => void
  onViewRanking: () => void
}

export function WhoScreen({ ballot, participantId, onSelect, onContinue, onViewRanking }: Props) {
  const voted = new Set(ballot.votes.map((v) => v.participantId))
  const votedCount = ballot.participants.filter((p) => voted.has(p.id)).length

  return (
    <main className="flex min-h-dvh flex-col justify-between gap-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <header className="flex flex-col gap-3.5">
        <h1 className="text-[34px] leading-[1.05] font-bold tracking-tight">Réveillon 2027 🍻</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Escolha as 3 casas que você mais curtiu, em ordem. O valor por pessoa é aproximado.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-[13px]">{plural(ballot.listings.length, 'casa', 'casas')}</span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[13px]">
            {votedCount} de {ballot.participants.length} já votaram
          </span>
        </div>
      </header>

      <section aria-labelledby="who-title" className="flex flex-col gap-2.5">
        <h2 id="who-title" className="text-sm font-semibold">
          Quem é você?
        </h2>
        <RadioGroup
          aria-labelledby="who-title"
          value={participantId ?? ''}
          onValueChange={onSelect}
          className="grid-cols-2"
        >
          {ballot.participants.map((p) => {
            const status = !p.isConfirmed
              ? 'em breve'
              : p.id === participantId
                ? 'é você'
                : voted.has(p.id)
                  ? 'já votou'
                  : 'ainda não votou'
            return (
              <RadioGroupCard key={p.id} value={p.id} disabled={!p.isConfirmed} className="group h-14">
                <span className="w-full truncate text-[15px] font-semibold">{p.isConfirmed ? p.name : 'A confirmar'}</span>
                <span
                  className={cn(
                    'text-xs',
                    voted.has(p.id) ? 'font-semibold text-primary' : 'text-muted-foreground',
                    'group-data-[state=checked]:font-normal group-data-[state=checked]:text-primary-foreground/85',
                  )}
                >
                  {status}
                </span>
              </RadioGroupCard>
            )
          })}
        </RadioGroup>
        <p className="text-[12.5px] text-muted-foreground">Já votou? Escolha seu nome de novo para trocar o voto.</p>
      </section>

      <footer className="flex flex-col gap-1.5">
        <Button size="lg" disabled={!participantId} onClick={onContinue}>
          Ver as casas
        </Button>
        <Button variant="link" onClick={onViewRanking}>
          Só ver o ranking
        </Button>
      </footer>
    </main>
  )
}
