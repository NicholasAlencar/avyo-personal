import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createId, EMPTY_STATE, normalizeState } from '../data/schema'
import { createInitialState } from '../data/seed'
import { loadState, saveState } from '../data/storage'

const FinanceContext = createContext(null)

export function FinanceProvider({ children, storage = globalThis.localStorage }) {
  const [state, setState] = useState(() => loadState(storage))

  const commit = useCallback((transition) => {
    setState((current) => {
      const next = normalizeState(typeof transition === 'function' ? transition(current) : transition)
      saveState(storage, next)
      return next
    })
  }, [storage])

  const addRecord = useCallback((collection, record) => commit((current) => ({
    ...current,
    [collection]: [...(current[collection] || []), { ...record, id: record.id || createId(collection.slice(0, -1)), createdAt: record.createdAt || new Date().toISOString() }],
  })), [commit])

  const updateRecord = useCallback((collection, id, patch) => commit((current) => ({
    ...current,
    [collection]: current[collection].map((record) => record.id === id ? { ...record, ...patch, updatedAt: new Date().toISOString() } : record),
  })), [commit])

  const removeRecord = useCallback((collection, id) => commit((current) => ({
    ...current,
    [collection]: current[collection].filter((record) => record.id !== id),
  })), [commit])

  const updateProfile = useCallback((patch) => commit((current) => ({ ...current, profile: { ...current.profile, ...patch } })), [commit])
  const updateSettings = useCallback((patch) => commit((current) => ({ ...current, settings: { ...current.settings, ...patch } })), [commit])
  const updateInvestmentProfile = useCallback((patch) => commit((current) => ({ ...current, investmentProfile: { ...current.investmentProfile, ...patch } })), [commit])
  const updatePaydayPlan = useCallback((next) => commit((current) => ({ ...current, atePagamento: typeof next === 'function' ? next(current.atePagamento) : next })), [commit])
  const replaceState = useCallback((next) => commit(next), [commit])
  const resetDemo = useCallback(() => commit(createInitialState()), [commit])
  const clearAll = useCallback(() => commit(EMPTY_STATE), [commit])

  const value = useMemo(() => ({ state, addRecord, updateRecord, removeRecord, updateProfile, updateSettings, updateInvestmentProfile, updatePaydayPlan, replaceState, resetDemo, clearAll }), [state, addRecord, updateRecord, removeRecord, updateProfile, updateSettings, updateInvestmentProfile, updatePaydayPlan, replaceState, resetDemo, clearAll])
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinanceStore() {
  const value = useContext(FinanceContext)
  if (!value) throw new Error('useFinanceStore must be used within FinanceProvider')
  return value
}
