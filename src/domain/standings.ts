import type { Ballot, Listing, Picks } from './types'

export const TOP_N = 3
export const POINTS = [3, 2, 1] as const

export type Standing = {
  listing: Listing
  points: number
  /** participant ids by position: voters[0] = who put it in 1st place */
  voters: string[][]
}

export function computeStandings({ listings, votes }: Pick<Ballot, 'listings' | 'votes'>): Standing[] {
  const rows = new Map<string, Standing>(
    listings.map((listing) => [listing.id, { listing, points: 0, voters: Array.from({ length: TOP_N }, () => []) }]),
  )
  for (const vote of votes) {
    vote.ranking.forEach((listingId, position) => {
      const row = rows.get(listingId)
      if (!row || position >= TOP_N) return
      row.points += POINTS[position]
      row.voters[position].push(vote.participantId)
    })
  }
  return [...rows.values()].toSorted(
    (a, b) =>
      b.points - a.points ||
      b.voters[0].length - a.voters[0].length ||
      b.voters[1].length - a.voters[1].length ||
      a.listing.name.localeCompare(b.listing.name, 'pt-BR'),
  )
}

export const requiredPicks = (listingCount: number) => Math.min(TOP_N, listingCount)

export const emptyPicks = (): Picks => Array.from({ length: TOP_N }, () => null)

/**
 * Puts a listing at a position. If the listing was already elsewhere in the top,
 * it swaps with whatever held the target position. `position = null` removes it.
 */
export function assignPick(picks: Picks, listingId: string, position: number | null): Picks {
  const next = [...picks]
  const current = next.indexOf(listingId)
  if (position === null) {
    if (current >= 0) next[current] = null
    return next
  }
  const displaced = next[position]
  if (current >= 0) next[current] = displaced === listingId ? null : displaced
  next[position] = listingId
  return next
}

export function movePick(picks: Picks, from: number, to: number): Picks {
  const next = [...picks]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

export const isComplete = (picks: Picks, listingCount: number) =>
  picks.slice(0, requiredPicks(listingCount)).every(Boolean)

export const samePicks = (a: Picks, b: string[] | undefined) =>
  !!b && b.length === a.filter(Boolean).length && b.every((id, i) => a[i] === id)
