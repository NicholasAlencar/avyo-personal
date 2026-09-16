import { expect, test } from 'vitest'
import { calculateUntilPayday, detectCommitments, simulatePayday } from './untilPayday'

test('calculates free balance plus daily and weekly rhythm with manual commitments', () => {
  expect(calculateUntilPayday({
    balance: 2000,
    plannedItems: [{ id: 'rent', amount: 400 }],
    extraItems: [{ id: 'market', amount: 100, type: 'expense' }],
    safetyReserve: 500,
    nextPaymentDate: '2026-09-20',
    today: '2026-09-15',
  })).toMatchObject({ committed: 500, remainingFree: 1000, dailyRhythm: 200, weeklyRhythm: 1400, status: 'healthy' })
})

test('ignores paid commitments and includes registered extra income and today spending', () => {
  expect(calculateUntilPayday({
    balance: 1000,
    plannedItems: [{ id: 'rent', amount: 300 }, { id: 'internet', amount: 100 }],
    extraItems: [{ id: 'freela', amount: 250, type: 'income' }],
    paidItemIds: ['rent'],
    todaySpent: 50,
    safetyReserve: 200,
    nextPaymentDate: '2026-09-20',
    today: '2026-09-15',
  })).toMatchObject({ committed: 100, extraIncome: 250, remainingFree: 900, dailyRhythm: 180 })
})

test('marks expired and constrained plans safely', () => {
  expect(calculateUntilPayday({ balance: 100, plannedItems: [{ amount: 200 }], safetyReserve: 50, nextPaymentDate: '2026-09-14', today: '2026-09-15' }))
    .toMatchObject({ remainingFree: -150, days: 0, dailyRhythm: 0, weeklyRhythm: 0, status: 'critical', isExpired: true })
})

test('detects recurring and installment commitments without mutating finance state', () => {
  const state = {
    transactions: [{ id: 'tx-rent', type: 'expense', description: 'Aluguel', amount: 800, recurring: true }],
    installments: [{ id: 'inst-1', description: 'Notebook', monthlyValue: 200, remainingMonths: 3 }],
    subscriptions: [{ id: 'sub-1', name: 'Streaming', monthlyValue: 30, active: true }, { id: 'sub-2', name: 'Cancelada', monthlyValue: 20, active: false }],
  }
  const result = detectCommitments(state, '2026-09-30')
  expect(result.map((item) => item.description)).toEqual(expect.arrayContaining(['Aluguel', 'Notebook', 'Streaming']))
  expect(result).toHaveLength(3)
})

test('simulates an expense or income without changing the saved plan', () => {
  const plan = { balance: 1000, plannedItems: [], extraItems: [], safetyReserve: 0, nextPaymentDate: '2026-09-20', today: '2026-09-15' }
  expect(simulatePayday(plan, { amount: 100, type: 'expense' }).remainingFree).toBe(900)
  expect(simulatePayday(plan, { amount: 100, type: 'income' }).remainingFree).toBe(1100)
  expect(plan.extraItems).toEqual([])
})
