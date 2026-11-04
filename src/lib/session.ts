// Per-device conveniences. Storage can be unavailable (private mode), so every access is guarded.
const KEYS = {
  password: 'nye-ballot-2027:password',
  participant: 'nye-ballot-2027:participant',
} as const

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // ignore: the app still works for this visit
  }
}

export const session = {
  getPassword: () => read(KEYS.password),
  setPassword: (value: string | null) => write(KEYS.password, value),
  getParticipant: () => read(KEYS.participant),
  setParticipant: (value: string | null) => write(KEYS.participant, value),
}
