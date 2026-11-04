import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { StandingDrawer } from '@/components/standing-drawer'
import { Button } from '@/components/ui/button'
import { assignPick, compactPicks, computeStandings, emptyPicks, movePick, TOP_N } from '@/domain/standings'
import type { Ballot, Picks } from '@/domain/types'
import { useBallot } from '@/hooks/use-ballot'
import { castVote, InvalidPasswordError, saveOpinion } from '@/lib/api'
import { session } from '@/lib/session'
import { cn } from '@/lib/utils'
import { HouseScreen } from '@/screens/house-screen'
import { ListScreen } from '@/screens/list-screen'
import { OpinionsScreen } from '@/screens/opinions-screen'
import { LockScreen } from '@/screens/lock-screen'
import { ReviewScreen } from '@/screens/review-screen'
import { WhoScreen } from '@/screens/who-screen'

type View = 'who' | 'list' | 'house' | 'opinions' | 'review'

/** Phone-width column; `wide` lets the house and review screens use desktop space. */
function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        'mx-auto min-h-dvh max-w-[440px] bg-background shadow-[0_0_0_1px_var(--border)]',
        wide && 'md:max-w-[1120px]',
      )}
    >
      {children}
    </div>
  )
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
  const [view, setView] = useState<View>(() => (session.getParticipant() ? 'list' : 'who'))
  const [index, setIndex] = useState(0)
  /** Unsent changes per participant; without a draft, the saved vote is shown. */
  const [drafts, setDrafts] = useState<Record<string, Picks>>({})
  const [submitting, setSubmitting] = useState(false)
  const [savingOpinion, setSavingOpinion] = useState(false)
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

  const signOut = () => {
    session.setParticipant(null)
    setParticipantId(null)
    navigate('who')
  }

  const selectParticipant = (id: string) => {
    session.setParticipant(id)
    setParticipantId(id)
  }

  const openListing = (listingId: string) => {
    navigate(
      'house',
      Math.max(
        0,
        ballot.listings.findIndex((l) => l.id === listingId),
      ),
    )
  }

  const submit = async () => {
    if (!participant || !password) return
    setSubmitting(true)
    try {
      await castVote(password, participant.id, compactPicks(picks))
      toast('Voto enviado')
      await refresh()
    } catch (error) {
      if (error instanceof InvalidPasswordError) lock()
      else toast('Não deu para enviar. Verifica a internet e tenta de novo.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitOpinion = async (listingId: string, body: string) => {
    if (!participant || !password) return
    setSavingOpinion(true)
    try {
      const result = await saveOpinion(password, participant.id, listingId, body)
      toast(result.deleted ? 'Análise apagada' : 'Análise publicada')
      await refresh()
    } catch (error) {
      if (error instanceof InvalidPasswordError) lock()
      else toast('Não deu para salvar. Verifica a internet e tenta de novo.')
    } finally {
      setSavingOpinion(false)
    }
  }

  const currentListing = ballot.listings[Math.min(index, listingCount - 1)]

  let screen: React.ReactNode
  if (view === 'opinions' && participant && currentListing) {
    screen = (
      <OpinionsScreen
        key={currentListing.id}
        ballot={ballot}
        participant={participant}
        listing={currentListing}
        saving={savingOpinion}
        onBack={() => navigate('house')}
        onSave={(body) => void submitOpinion(currentListing.id, body)}
      />
    )
  } else if (view === 'review') {
    screen = (
      <ReviewScreen
        ballot={ballot}
        standings={standings}
        participant={participant}
        picks={picks}
        submitting={submitting}
        onMove={(from, to) => updatePicks((p) => movePick(p, from, to))}
        onChoose={() => navigate('list')}
        onSubmit={() => void submit()}
        onBack={() => navigate(participant && listingCount ? 'list' : 'who')}
        onSignOut={signOut}
        onOpenStanding={setOpenListingId}
      />
    )
  } else if (view === 'list' && participant && listingCount > 0) {
    screen = (
      <ListScreen
        ballot={ballot}
        participant={participant}
        picks={picks}
        onOpenListing={(next) => navigate('house', next)}
        onOpenReview={() => navigate('review')}
        onSignOut={signOut}
      />
    )
  } else if (view === 'house' && participant && listingCount > 0) {
    screen = (
      <HouseScreen
        ballot={ballot}
        index={Math.min(index, listingCount - 1)}
        picks={picks}
        onIndexChange={(next) => navigate('house', next)}
        onPick={(listingId, position) => updatePicks((p) => assignPick(p, listingId, position))}
        onOpenReview={() => navigate('review')}
        onOpenList={() => navigate('list')}
        onOpenOpinions={() => navigate('opinions')}
      />
    )
  } else {
    screen = (
      <WhoScreen
        ballot={ballot}
        participantId={participant?.id ?? null}
        onSelect={selectParticipant}
        onContinue={() => navigate(listingCount ? 'list' : 'review')}
        onViewRanking={() => navigate('review')}
      />
    )
  }

  const isWide = view === 'review' || ((view === 'house' || view === 'list') && !!participant && listingCount > 0)

  return (
    <Shell wide={isWide}>
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
                openListing(listingId)
              }
            : undefined
        }
      />
    </Shell>
  )
}
