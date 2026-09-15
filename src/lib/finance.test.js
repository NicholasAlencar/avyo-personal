import { expect, test } from 'vitest'
import { aggregateFinance } from './finance'

test('aggregates monthly cash flow, net worth and reserve coverage', () => {
  const state = {
    transactions: [
      { type: 'income', amount: 5000, category: 'Renda', date: '2026-09-05' },
      { type: 'expense', amount: 2000, category: 'Moradia', date: '2026-09-06' },
      { type: 'expense', amount: 1200, category: 'Alimentação', date: '2026-09-10' },
    ],
    subscriptions: [{ active: true, monthlyValue: 100 }], installments: [{ monthlyValue: 200 }],
    assets: [{ value: 20000 }], liabilities: [{ value: 5000 }], cards: [{ limit: 4000, currentBill: 1000 }],
    budgets: [{ category: 'Alimentação', limit: 1000 }],
    profile: { income: 5000, essentialCost: 2000, monthsGoal: 6, reserveAmount: 6000 },
  }
  const f = aggregateFinance(state, '2026-09')
  expect(f.income).toBe(5000)
  expect(f.expenses).toBe(3200)
  expect(f.result).toBe(1800)
  expect(f.savingsRate).toBe(36)
  expect(f.netWorth).toBe(15000)
  expect(f.reserveTarget).toBe(12000)
  expect(f.monthsCovered).toBe(3)
  expect(f.overBudget[0].category).toBe('Alimentação')
})

test('keeps the financial health score inside zero to one hundred', () => {
  const f = aggregateFinance({ transactions: [], subscriptions: [], installments: [], assets: [], liabilities: [], cards: [], budgets: [], profile: {} }, '2026-09')
  expect(f.healthScore).toBeGreaterThanOrEqual(0)
  expect(f.healthScore).toBeLessThanOrEqual(100)
})
