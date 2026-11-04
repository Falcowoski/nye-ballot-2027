import { OTPInput, OTPInputContext } from 'input-otp'
import * as React from 'react'

import { cn } from '@/lib/utils'

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn('flex items-center gap-2 has-disabled:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="input-otp-group" className={cn('flex w-full gap-2', className)} {...props} />
}

function InputOTPSlot({
  index,
  masked = false,
  className,
  ...props
}: React.ComponentProps<'div'> & { index: number; masked?: boolean }) {
  const context = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = context?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'relative flex h-14 flex-1 items-center justify-center rounded-lg border border-input bg-muted text-2xl font-semibold transition-all data-[active=true]:z-10 data-[active=true]:border-primary data-[active=true]:ring-[3px] data-[active=true]:ring-ring/25 aria-invalid:border-warning',
        className,
      )}
      {...props}
    >
      {char ? (masked ? '•' : char) : null}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-pulse bg-foreground" />
        </div>
      )}
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot }
