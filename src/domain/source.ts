import { formatDecimal, plural } from './format'
import type { Listing } from './types'

/** Where a listing was published, read from its link. */
export type ListingSource = 'airbnb' | 'booking' | 'other'

/** Label for the link that opens the original listing. */
export const VIEW_LISTING_LABEL: Record<ListingSource, string> = {
  airbnb: 'Ver no Airbnb',
  booking: 'Ver no Booking',
  other: 'Ver anúncio',
}

export function listingSource(url: string | null): ListingSource {
  if (!url) return 'other'
  try {
    const host = new URL(url).hostname
    if (/(^|\.)airbnb\./.test(host)) return 'airbnb'
    if (/(^|\.)booking\.com$/.test(host)) return 'booking'
  } catch {
    // a malformed link is still shown, just without a site name
  }
  return 'other'
}

/** "4,66 (32)" on Airbnb's 5-point scale, "Nota 10 · 1 avaliação" on Booking's 10-point one. */
export function formatRating({ rating, reviewCount, url }: Pick<Listing, 'rating' | 'reviewCount' | 'url'>) {
  if (rating == null) return null
  if (listingSource(url) === 'booking') {
    const reviews = reviewCount != null ? ` · ${plural(reviewCount, 'avaliação', 'avaliações')}` : ''
    return { scale: 10, text: `Nota ${formatDecimal(rating)}${reviews}` }
  }
  return { scale: 5, text: `${formatDecimal(rating)}${reviewCount != null ? ` (${reviewCount})` : ''}` }
}
