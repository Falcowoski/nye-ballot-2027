const brlWhole = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

const brlCents = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatBrl = (value: number) => brlWhole.format(Math.round(value))
export const formatBrlCents = (value: number) => brlCents.format(value)
export const formatDecimal = (value: number) => decimal.format(value)
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))

export const plural = (count: number, one: string, many: string) =>
  `${formatDecimal(count)} ${count === 1 ? one : many}`

/** "Léo F" → "LF", "Gus" → "G" */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : parts[0][0].toUpperCase()
}

export function joinNames(names: string[]) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}
