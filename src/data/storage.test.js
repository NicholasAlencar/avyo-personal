import { beforeEach, expect, test } from 'vitest'
import { createInitialState } from './seed'
import { loadState, saveState, STORAGE_KEY } from './storage'

function makeStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  }
}

let storage
beforeEach(() => { storage = makeStorage() })

test('loads coherent demonstration data when storage is empty', () => {
  const state = loadState(storage)
  expect(state.version).toBe(1)
  expect(state.transactions.length).toBeGreaterThan(5)
  expect(state.profile.name).toBe('Marina')
})

test('persists and reloads a financial document', () => {
  const state = createInitialState()
  state.profile.name = 'Ana'
  saveState(storage, state)
  expect(loadState(storage).profile.name).toBe('Ana')
  expect(JSON.parse(storage.getItem(STORAGE_KEY)).version).toBe(1)
})

test('backs up corrupt content before restoring demonstration data', () => {
  storage.setItem(STORAGE_KEY, '{broken-json')
  const state = loadState(storage)
  expect(storage.getItem('avyo-personal:corrupt-backup')).toBe('{broken-json')
  expect(state.profile.name).toBe('Marina')
})
