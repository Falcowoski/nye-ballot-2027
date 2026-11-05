export type Participant = {
  id: string
  name: string
  stayDays: number
  isConfirmed: boolean
}

export type Listing = {
  id: string
  name: string
  location: string
  /** Link to the listing on Airbnb, Booking or another site. */
  url: string | null
  totalPrice: number | null
  bedrooms: number | null
  beds: number | null
  bathrooms: number | null
  beachAccess: string | null
  rating: number | null
  reviewCount: number | null
  note: string | null
  /** Short points taken from the listing's description. */
  highlights: string[]
  suggestedBy: string | null
  photos: string[]
}

export type Vote = {
  participantId: string
  ranking: string[]
  updatedAt: string
}

export type Opinion = {
  participantId: string
  listingId: string
  body: string
  updatedAt: string
}

export type Ballot = {
  participants: Participant[]
  listings: Listing[]
  votes: Vote[]
  /** Newest first. */
  opinions: Opinion[]
}

/** The voter's current top picks, by position (index 0 = 1st place). */
export type Picks = (string | null)[]
