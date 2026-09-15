import { act, renderHook } from '@testing-library/react'
import { expect, test } from 'vitest'
import { FinanceProvider, useFinanceStore } from './FinanceContext'

function makeStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

test('adds a record and persists the observable state change', () => {
  const storage = makeStorage()
  const wrapper = ({ children }) => <FinanceProvider storage={storage}>{children}</FinanceProvider>
  const { result } = renderHook(() => useFinanceStore(), { wrapper })

  act(() => result.current.addRecord('transactions', { type: 'expense', description: 'Livro', amount: 80, category: 'Educação', date: '2026-09-15' }))

  expect(result.current.state.transactions.some((item) => item.description === 'Livro')).toBe(true)
  expect(JSON.parse(storage.getItem('avyo-personal:v1')).transactions.some((item) => item.description === 'Livro')).toBe(true)
})

test('updates and removes records by id', () => {
  const storage = makeStorage()
  const wrapper = ({ children }) => <FinanceProvider storage={storage}>{children}</FinanceProvider>
  const { result } = renderHook(() => useFinanceStore(), { wrapper })
  const id = result.current.state.goals[0].id

  act(() => result.current.updateRecord('goals', id, { saved: 4200 }))
  expect(result.current.state.goals.find((item) => item.id === id).saved).toBe(4200)
  act(() => result.current.removeRecord('goals', id))
  expect(result.current.state.goals.some((item) => item.id === id)).toBe(false)
})

test('updates version 2 settings and nested planning state without replacing collections', () => {
  const storage = makeStorage()
  const wrapper = ({ children }) => <FinanceProvider storage={storage}>{children}</FinanceProvider>
  const { result } = renderHook(() => useFinanceStore(), { wrapper })
  const transactionIds = result.current.state.transactions.map((item) => item.id)

  act(() => result.current.updateSettings({ aiEnabled: true }))
  act(() => result.current.updateInvestmentProfile({ tolerance: 3, reasons: ['aposentadoria'] }))
  act(() => result.current.updatePaydayPlan((plan) => ({ ...plan, todaySpent: 75 })))

  expect(result.current.state.settings).toEqual({ aiEnabled: true, aiDisclosureAccepted: false })
  expect(result.current.state.investmentProfile).toMatchObject({ tolerance: 3, reasons: ['aposentadoria'] })
  expect(result.current.state.atePagamento.todaySpent).toBe(75)
  expect(result.current.state.transactions.map((item) => item.id)).toEqual(transactionIds)
  expect(JSON.parse(storage.getItem('avyo-personal:v1')).version).toBe(2)
})
