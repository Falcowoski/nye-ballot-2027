import type { Participant } from './types'

export const INSTALLMENTS = 6

export type StayGroup = { days: number; count: number }

/** Participants grouped by how many days they stay, longest stay first. */
export function stayGroups(participants: Participant[]): StayGroup[] {
  const byDays = new Map<number, number>()
  for (const p of participants) byDays.set(p.stayDays, (byDays.get(p.stayDays) ?? 0) + 1)
  return [...byDays.entries()].map(([days, count]) => ({ days, count })).toSorted((a, b) => b.days - a.days)
}

export type PriceSplit = {
  /** Approximate share for someone staying the whole trip. */
  fullStay: number
  /** Approximate share for each shorter stay, by group. */
  shorterStays: { days: number; count: number; share: number }[]
  installment: number
}

/**
 * Splits the total by person-days: 9 people × 7 days + 1 × 2 days = 65 person-days,
 * so a full stay pays 7/65 of the total and a 2-day stay pays 2/65.
 */
export function splitPrice(totalPrice: number, participants: Participant[]): PriceSplit | null {
  const groups = stayGroups(participants)
  const personDays = groups.reduce((sum, g) => sum + g.days * g.count, 0)
  if (!personDays) return null
  const perDay = totalPrice / personDays
  const [longest, ...rest] = groups
  const fullStay = perDay * longest.days
  return {
    fullStay,
    shorterStays: rest.map((g) => ({ ...g, share: perDay * g.days })),
    installment: fullStay / INSTALLMENTS,
  }
}

/** "9 pessoas por 7 dias e 1 por 2 dias" */
export function describeStays(participants: Participant[]) {
  const groups = stayGroups(participants)
  const parts = groups.map(
    (g, i) =>
      `${g.count}${i === 0 ? (g.count === 1 ? ' pessoa' : ' pessoas') : ''} por ${g.days} ${g.days === 1 ? 'dia' : 'dias'}`,
  )
  if (parts.length <= 1) return parts.join('')
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`
}
