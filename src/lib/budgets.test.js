import { describe, expect, test } from 'vitest'
import { buildBudgetRows, roundedSuggestion } from './budgets'

describe('budget planning', () => {
  test('includes categories without limits and rounds a three-month suggestion', () => {
    const state = {
      budgets: [{ id: 'budget-food', category: 'Alimentação', limit: 500 }],
      transactions: [
        { id: 'jul-health', type: 'expense', category: 'Saúde', amount: 120, date: '2026-07-05' },
        { id: 'aug-health', type: 'expense', category: 'Saúde', amount: 180, date: '2026-08-05' },
        { id: 'sep-health', type: 'expense', category: 'Saúde', amount: 210, date: '2026-09-05' },
        { id: 'sep-food', type: 'expense', category: 'Alimentação', amount: 320, date: '2026-09-06' },
        { id: 'sep-income', type: 'income', category: 'Renda', amount: 5000, date: '2026-09-01' },
      ],
    }

    const rows = buildBudgetRows(state, '2026-09')
    expect(rows.find((row) => row.category === 'Saúde')).toMatchObject({ limit: null, spent: 210, suggested: 200 })
    expect(rows.find((row) => row.category === 'Alimentação')).toMatchObject({ limit: 500, spent: 320 })
    expect(rows.every((row) => row.suggested % 50 === 0)).toBe(true)
  })

  test('rounds suggestions up to the next fifty reais', () => {
    expect(roundedSuggestion([101, 149, 151])).toBe(150)
    expect(roundedSuggestion([])).toBe(0)
  })
})
