import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatBrl, formatDateTime } from '@/domain/format'
import { splitPrice } from '@/domain/pricing'
import { TOP_N, type Standing } from '@/domain/standings'
import type { Ballot } from '@/domain/types'

type Props = {
  ballot: Ballot
  standing: Standing | null
  rank: number
  onClose: () => void
  onViewListing?: (listingId: string) => void
}

type Entry = { participantId: string; name: string; position: number; updatedAt: string }

export function StandingDrawer({ ballot, standing, rank, onClose, onViewListing }: Props) {
  return (
    <Drawer open={!!standing} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        {standing && <Body ballot={ballot} standing={standing} rank={rank} onViewListing={onViewListing} />}
      </DrawerContent>
    </Drawer>
  )
}

function Body({ ballot, standing, rank, onViewListing }: Omit<Props, 'onClose'> & { standing: Standing }) {
  const nameOf = (id: string) => ballot.participants.find((p) => p.id === id)?.name ?? 'Alguém'
  const updatedAtOf = (id: string) => ballot.votes.find((v) => v.participantId === id)?.updatedAt ?? ''

  const entries: Entry[] = standing.voters
    .flatMap((ids, position) =>
      ids.map((participantId) => ({
        participantId,
        name: nameOf(participantId),
        position,
        updatedAt: updatedAtOf(participantId),
      })),
    )
    .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const split = standing.listing.totalPrice ? splitPrice(standing.listing.totalPrice, ballot.participants) : null
  const description = [
    `${standing.points} ${standing.points === 1 ? 'ponto' : 'pontos'} de ${entries.length} ${entries.length === 1 ? 'voto' : 'votos'}`,
    split && `≈ ${formatBrl(split.fullStay)} por pessoa`,
  ]
    .filter(Boolean)
    .join(' · ')

  const tabs = [
    { value: 'all', label: 'Todos', items: entries, empty: 'Ninguém votou nessa casa ainda.' },
    ...Array.from({ length: TOP_N }, (_, p) => ({
      value: String(p),
      label: `${p + 1}º`,
      items: entries.filter((e) => e.position === p),
      empty: `Ninguém colocou essa casa em ${p + 1}º ainda.`,
    })),
  ]

  return (
    <>
      <DrawerHeader className="flex-row items-center gap-3 md:px-6 md:pt-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
          {rank}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <DrawerTitle className="line-clamp-2 leading-snug md:text-xl">{standing.listing.name}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </div>
      </DrawerHeader>

      <Tabs defaultValue="all" className="min-h-0 flex-1 px-4 pt-3 md:px-6 md:pt-4">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label} {t.items.length}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent
            key={t.value}
            value={t.value}
            className="max-h-[42dvh] overflow-y-auto md:max-h-[55dvh] md:min-h-56"
          >
            {t.items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t.empty}</p>
            ) : (
              <ul className="flex flex-col">
                {t.items.map((e) => (
                  <li key={e.participantId} className="flex items-center gap-3 py-2.5">
                    <Avatar name={e.name} size="lg" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[15px] font-medium">{e.name}</span>
                      {e.updatedAt && (
                        <span className="text-[12.5px] text-muted-foreground">{formatDateTime(e.updatedAt)}</span>
                      )}
                    </span>
                    <span className="rounded-full border px-2.5 py-0.5 text-[13px] font-semibold">
                      {e.position + 1}º
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {onViewListing && (
        <div className="p-4 md:px-6 md:pb-6">
          <Button variant="outline" className="w-full" onClick={() => onViewListing(standing.listing.id)}>
            Ver a casa
          </Button>
        </div>
      )}
    </>
  )
}
