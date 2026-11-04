import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { StandingDrawer } from '@/components/standing-drawer'
import { Button } from '@/components/ui/button'
import { assignPick, computeStandings, emptyPicks, movePick, requiredPicks, TOP_N } from '@/domain/standings'
import type { Ballot, Picks } from '@/domain/types'
import { useBallot } from '@/hooks/use-ballot'
import { castVote, InvalidPasswordError } from '@/lib/api'
import { session } from '@/lib/session'
import { HouseScreen } from '@/screens/house-screen'
import { LockScreen } from '@/screens/lock-screen'
import { ReviewScreen } from '@/screens/review-screen'
import { WhoScreen } from '@/screens/who-screen'

type View = 'who' | 'house' | 'review'

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-dvh max-w-[440px] bg-background shadow-[0_0_0_1px_var(--border)]">{children}</div>
}

/** The participant's saved vote as picks, ignoring listings that are no longer active. */
function picksFromVote(ballot: Ballot, participantId: string): Picks {
  const active = new Set(ballot.listings.map((l) => l.id))
  const saved = ballot.votes.find((v) => v.participantId === participantId)?.ranking ?? []
  const picks = emptyPicks()
  saved.slice(0, TOP_N).forEach((id, i) => {
    if (active.has(id)) picks[i] = id
  })
  return picks
}

export default function App() {
  const [password, setPassword] = useState(() => session.getPassword())
  const lock = () => {
    session.setPassword(null)
    setPassword(null)
  }
  const { ballot, status, refresh } = useBallot(password, lock)

  const [participantId, setParticipantId] = useState(() => session.getParticipant())
  const [view, setView] = useState<View>(() => (session.getParticipant() ? 'house' : 'who'))
  const [index, setIndex] = useState(0)
  /** Unsent changes per participant; without a draft, the saved vote is shown. */
  const [drafts, setDrafts] = useState<Record<string, Picks>>({})
  const [submitting, setSubmitting] = useState(false)
  const [openListingId, setOpenListingId] = useState<string | null>(null)

  const standings = useMemo(() => (ballot ? computeStandings(ballot) : []), [ballot])

  if (!password) {
    return (
      <Shell>
        <LockScreen
          onUnlock={(value) => {
            session.setPassword(value)
            setPassword(value)
          }}
        />
      </Shell>
    )
  }

  if (!ballot) {
    return (
      <Shell>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
          {status === 'error' ? (
            <>
              <p className="text-[15px]">Não deu para carregar as casas. Verifica a internet e tenta de novo.</p>
              <Button variant="outline" onClick={() => void refresh()}>
                Tentar de novo
              </Button>
            </>
          ) : (
            <p className="text-[15px] text-muted-foreground">Carregando as casas…</p>
          )}
        </main>
      </Shell>
    )
  }

  const participant = ballot.participants.find((p) => p.id === participantId && p.isConfirmed) ?? null
  const picks = participant ? (drafts[participant.id] ?? picksFromVote(ballot, participant.id)) : emptyPicks()
  const listingCount = ballot.listings.length
  const openIndex = standings.findIndex((s) => s.listing.id === openListingId)

  const navigate = (next: View, nextIndex = index) => {
    setView(next)
    setIndex(nextIndex)
    window.scrollTo({ top: 0 })
  }

  const updatePicks = (change: (current: Picks) => Picks) => {
    if (!participant) return
    setDrafts((all) => ({ ...all, [participant.id]: change(picks) }))
  }

  const selectParticipant = (id: string) => {
    session.setParticipant(id)
    setParticipantId(id)
  }

  const goToHouses = (listingId?: string) => {
    const target = listingId
      ? ballot.listings.findIndex((l) => l.id === listingId)
      : ballot.listings.findIndex((l) => !picks.includes(l.id))
    navigate('house', Math.max(0, target))
  }

  const submit = async () => {
    if (!participant || !password) return
    setSubmitting(true)
    try {
      await castVote(password, participant.id, picks.slice(0, requiredPicks(listingCount)) as string[])
      toast('Voto enviado')
      await refresh()
    } catch (error) {
      if (error instanceof InvalidPasswordError) lock()
      else toast('Não deu para enviar. Verifica a internet e tenta de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  let screen: React.ReactNode
  if (view === 'review') {
    screen = (
      <ReviewScreen
        ballot={ballot}
        standings={standings}
        participant={participant}
        picks={picks}
        submitting={submitting}
        onMove={(from, to) => updatePicks((p) => movePick(p, from, to))}
        onChoose={() => goToHouses()}
        onSubmit={() => void submit()}
        onBack={() => navigate(participant && listingCount ? 'house' : 'who')}
        onChangePerson={() => navigate('who')}
        onOpenStanding={setOpenListingId}
      />
    )
  } else if (view === 'house' && participant && listingCount > 0) {
    screen = (
      <HouseScreen
        ballot={ballot}
        participant={participant}
        index={Math.min(index, listingCount - 1)}
        picks={picks}
        onIndexChange={(next) => navigate('house', next)}
        onPick={(listingId, position) => updatePicks((p) => assignPick(p, listingId, position))}
        onOpenReview={() => navigate('review')}
        onChangePerson={() => navigate('who')}
      />
    )
  } else {
    screen = (
      <WhoScreen
        ballot={ballot}
        participantId={participant?.id ?? null}
        onSelect={selectParticipant}
        onContinue={() => (listingCount ? goToHouses(ballot.listings[0].id) : navigate('review'))}
        onViewRanking={() => navigate('review')}
      />
    )
  }

  return (
    <Shell>
      {screen}
      <StandingDrawer
        ballot={ballot}
        standing={openIndex >= 0 ? standings[openIndex] : null}
        rank={openIndex + 1}
        onClose={() => setOpenListingId(null)}
        onViewListing={
          participant
            ? (listingId) => {
                setOpenListingId(null)
                goToHouses(listingId)
              }
            : undefined
        }
      />
    </Shell>
  )
}
