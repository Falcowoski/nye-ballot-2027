import { useCallback, useEffect, useRef, useState } from 'react'

import type { Ballot } from '@/domain/types'
import { getBallot, InvalidPasswordError } from '@/lib/api'

const REFRESH_MS = 30_000

type Status = 'loading' | 'ready' | 'error'

/**
 * Loads the ballot and keeps it fresh: on mount, when the tab becomes visible again,
 * and every 30 s while visible. A rejected password is reported through `onInvalidPassword`.
 */
export function useBallot(password: string | null, onInvalidPassword: () => void) {
  const [ballot, setBallot] = useState<Ballot | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const inFlight = useRef(false)
  const onInvalid = useRef(onInvalidPassword)
  useEffect(() => {
    onInvalid.current = onInvalidPassword
  })

  const refresh = useCallback(async () => {
    if (!password || inFlight.current) return
    inFlight.current = true
    try {
      setBallot(await getBallot(password))
      setStatus('ready')
    } catch (error) {
      if (error instanceof InvalidPasswordError) onInvalid.current()
      else setStatus((prev) => (prev === 'ready' ? prev : 'error'))
    } finally {
      inFlight.current = false
    }
  }, [password])

  useEffect(() => {
    if (!password) return
    // oxlint-disable-next-line react/set-state-in-effect -- state only changes after the network response
    void refresh()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    const timer = window.setInterval(onVisible, REFRESH_MS)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(timer)
    }
  }, [password, refresh])

  return { ballot, status, refresh }
}
