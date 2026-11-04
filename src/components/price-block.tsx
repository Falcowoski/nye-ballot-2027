import { formatBrl, formatBrlCents } from '@/domain/format'
import { describeStays, INSTALLMENTS, splitPrice } from '@/domain/pricing'
import type { Participant } from '@/domain/types'

export function PriceBlock({ totalPrice, participants }: { totalPrice: number | null; participants: Participant[] }) {
  const split = totalPrice ? splitPrice(totalPrice, participants) : null

  if (!totalPrice || !split) {
    return (
      <div className="flex flex-col gap-0.5">
        <p className="text-xl font-bold">Preço a confirmar</p>
        <p className="text-xs text-muted-foreground">O valor total dessa casa ainda vai ser adicionado.</p>
      </div>
    )
  }

  const shorter = split.shorterStays.map((s) => `≈ ${formatBrl(s.share)}`).join(', ')

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[30px] leading-tight font-bold tracking-tight tabular-nums">
        ≈ {formatBrl(split.fullStay)} <span className="text-sm font-medium tracking-normal text-muted-foreground">/pessoa</span>
      </p>
      <p className="text-[13.5px] text-muted-foreground tabular-nums">
        ou {INSTALLMENTS}× {formatBrlCents(split.installment)} · {formatBrl(totalPrice)} no total
      </p>
      <p className="text-xs text-muted-foreground">
        Aproximado: {describeStays(participants)}
        {shorter ? ` (${shorter})` : ''}.
      </p>
    </div>
  )
}
