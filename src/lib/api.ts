import { createClient } from '@supabase/supabase-js'

import type { Ballot } from '@/domain/types'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export class InvalidPasswordError extends Error {
  constructor() {
    super('invalid_password')
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    if (error.message.includes('invalid_password')) throw new InvalidPasswordError()
    throw new Error(error.message)
  }
  return data as T
}

export const checkPassword = (password: string) => rpc<boolean>('check_password', { p_password: password })

export const getBallot = (password: string) => rpc<Ballot>('get_ballot', { p_password: password })

export const castVote = (password: string, participantId: string, ranking: string[]) =>
  rpc<{ ok: boolean; updatedAt: string }>('cast_vote', {
    p_password: password,
    p_participant_id: participantId,
    p_ranking: ranking,
  })
