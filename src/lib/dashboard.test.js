import { describe, expect, test } from 'vitest'
import { createInitialState } from '../data/seed'
import { monthKey } from './format'
import { buildDashboard } from './dashboard'

describe('buildDashboard', () => {
  test('shows plan balances, five indicators and three fixed journeys', () => {
    const view = buildDashboard(createInitialState(), monthKey())

    expect(view.situation).toEqual(expect.objectContaining({
      committed: expect.any(Number),
      free: expect.any(Number),
      total: expect.any(Number),
      hasPlan: true,
    }))
    expect(view.indicators.map((item) => item.key)).toEqual(['result', 'income', 'expenses', 'protection', 'netWorth'])
    expect(view.journeys.map((item) => item.title)).toEqual(['Organizar', 'Proteger e planejar', 'Crescer'])
    expect(view.pulse).toEqual(expect.objectContaining({ score: expect.any(Number), label: expect.any(String), cta: expect.any(Object) }))
  })

  test('falls back to the monthly result when there is no active payday plan', () => {
    const state = createInitialState()
    state.atePagamento = { ...state.atePagamento, status: 'inactive' }

    const view = buildDashboard(state, monthKey())

    expect(view.situation.hasPlan).toBe(false)
    expect(view.situation.committed).toBe(0)
    expect(view.situation.total).toBe(view.finance.result)
    expect(view.situation.free).toBe(view.finance.result)
  })
})
