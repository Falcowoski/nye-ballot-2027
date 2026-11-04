import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { checkPassword } from '@/lib/api'

const LENGTH = 6

type State = 'idle' | 'checking' | 'wrong' | 'error'

const messages: Record<State, string> = {
  idle: '',
  checking: '',
  wrong: 'Senha errada. Confere no grupo e tenta de novo.',
  error: 'Não deu para conferir a senha. Verifica a internet e tenta de novo.',
}

export function LockScreen({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [value, setValue] = useState('')
  const [state, setState] = useState<State>('idle')

  async function submit(password: string) {
    if (password.length !== LENGTH || state === 'checking') return
    setState('checking')
    try {
      if (await checkPassword(password)) {
        onUnlock(password)
      } else {
        setState('wrong')
        setValue('')
      }
    } catch {
      setState('error')
    }
  }

  return (
    <main className="flex min-h-dvh flex-col gap-8 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <header className="flex flex-col gap-3.5">
        <h1 className="text-[34px] leading-[1.05] font-bold tracking-tight">Réveillon 2027 🍻</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Votação da casa do réveillon. Só para quem está no grupo.
        </p>
      </header>

      <form
        className="flex flex-1 flex-col justify-between gap-8"
        onSubmit={(event) => {
          event.preventDefault()
          void submit(value)
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="group-password" className="text-sm font-semibold">
            Senha do grupo
          </label>
          <InputOTP
            id="group-password"
            maxLength={LENGTH}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="off"
            value={value}
            onChange={(next) => {
              setValue(next)
              if (state === 'wrong' || state === 'error') setState('idle')
            }}
            onComplete={(next: string) => void submit(next)}
            disabled={state === 'checking'}
          >
            <InputOTPGroup>
              {Array.from({ length: LENGTH }, (_, i) => (
                <InputOTPSlot key={i} index={i} masked aria-invalid={state === 'wrong'} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className="text-[12.5px] text-muted-foreground">
            Não sabe a senha? Pede no grupo. Neste celular, você só digita uma vez.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p role="alert" className="min-h-[18px] text-[13px] text-warning">
            {messages[state]}
          </p>
          <Button type="submit" size="lg" disabled={value.length !== LENGTH || state === 'checking'}>
            {state === 'checking' ? 'Conferindo…' : 'Entrar'}
          </Button>
        </div>
      </form>
    </main>
  )
}
