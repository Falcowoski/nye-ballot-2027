import type { Ballot, Listing, Opinion, Participant } from './types'

/** Who wrote the listings' first-impression notes. */
export const NOTE_AUTHOR_NAME = 'Léo F'

export const OPINION_MAX_LENGTH = 500

export const noteAuthor = (participants: Participant[]) => participants.find((p) => p.name === NOTE_AUTHOR_NAME) ?? null

export const opinionsFor = (ballot: Pick<Ballot, 'opinions'>, listingId: string): Opinion[] =>
  ballot.opinions.filter((o) => o.listingId === listingId)

/** First impressions plus everyone else's analyses. */
export const analysisCount = (ballot: Pick<Ballot, 'opinions'>, listing: Listing) =>
  opinionsFor(ballot, listing.id).length + (listing.note ? 1 : 0)
