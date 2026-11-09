import { createClient } from '@supabase/supabase-js'

import type { Ballot } from '@/domain/types'

// In production the API goes through the site's own domain (see the /sb rewrite in vercel.json),
// so a visitor whose DNS can't resolve *.supabase.co can still vote.
const supabaseUrl = import.meta.env.PROD ? `${window.location.origin}/sb` : import.meta.env.VITE_SUPABASE_URL

const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
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

export const getBallot = async (password: string) => {
  const ballot = await rpc<Ballot>('get_ballot', { p_password: password })
  return { ...ballot, opinions: ballot.opinions ?? [] }
}

export const saveOpinion = (password: string, participantId: string, listingId: string, body: string) =>
  rpc<{ ok: boolean; deleted: boolean }>('save_opinion', {
    p_password: password,
    p_participant_id: participantId,
    p_listing_id: listingId,
    p_body: body,
  })

export const castVote = (password: string, participantId: string, ranking: string[]) =>
  rpc<{ ok: boolean; updatedAt: string }>('cast_vote', {
    p_password: password,
    p_participant_id: participantId,
    p_ranking: ranking,
  })
