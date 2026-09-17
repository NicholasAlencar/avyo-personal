import { EMPTY_STATE, normalizeState } from './schema'
import { createInitialState } from './seed'

export const STORAGE_KEY = 'avyo-personal:v1'
export const CORRUPT_BACKUP_KEY = 'avyo-personal:corrupt-backup'

export function loadState(storage = globalThis.localStorage) {
  const raw = storage?.getItem(STORAGE_KEY)
  if (!raw) return createInitialState()
  try {
    return normalizeState(JSON.parse(raw))
  } catch {
    storage?.setItem(CORRUPT_BACKUP_KEY, raw)
    const fresh = createInitialState()
    storage?.setItem(STORAGE_KEY, JSON.stringify(fresh))
    return fresh
  }
}

export function saveState(storage = globalThis.localStorage, state) {
  storage?.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)))
}

export function clearStoredState(storage = globalThis.localStorage) {
  storage?.removeItem(STORAGE_KEY)
  storage?.removeItem(CORRUPT_BACKUP_KEY)
  const empty = normalizeState(EMPTY_STATE)
  storage?.setItem(STORAGE_KEY, JSON.stringify(empty))
  return empty
}
