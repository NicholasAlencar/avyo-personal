import { expect, test } from 'vitest'
import { calculateUntilPayday, detectCommitments, simulatePayday } from './untilPayday'

test('calculates daily and weekly rhythm after detected and manual commitments', () => {
  const result = calculateUntilPayday({
    balance: 2000,
    plannedItems: [{ id: 'rent', amount: 400 }],
    extraItems: [{ id: 'course', amount: 100 }],
    safetyReserve: 500,
    nextPaymentDate: '2026-09-20',
    today: '2026-09-15',
  })

  expect(result).toMatchObject({
    committed: 500,
    remainingFree: 1000,
    days: 5,
    dailyRhythm: 200,
    weeklyRhythm: 1400,
    status: 'healthy',
    isExpired: false,
  })
})

test('ignores paid commitments and includes today spending and extra income', () => {
  const result = calculateUntilPayday({
    balance: 1200,
    plannedItems: [{ id: 'paid', amount: 300 }, { id: 'open', amount: 200 }],
    paidItemIds: ['paid'],
    safetyReserve: 200,
    todaySpent: 100,
    extraIncome: 250,
    nextPaymentDate: '2026-09-22',
    today: '2026-09-15',
  })

  expect(result).toMatchObject({ committed: 200, remainingFree: 950, days: 7 })
})

test('detects local recurring commitments without duplicating ids', () => {
  const commitments = detectCommitments({
    transactions: [
      { id: 'tx-rent', type: 'expense', description: 'Aluguel', amount: 1800, date: '2026-09-18', recurring: true },
      { id: 'tx-market', type: 'expense', description: 'Mercado', amount: 300, date: '2026-09-17', recurring: false },
    ],
    installments: [{ id: 'inst-phone', description: 'Celular', monthlyValue: 120, remainingMonths: 3 }],
    subscriptions: [{ id: 'sub-music', name: 'Música', monthlyValue: 25, active: true }],
  }, '2026-09-20', '2026-09-15')

  expect(commitments.map((item) => item.id)).toEqual(['tx-rent', 'inst-phone', 'sub-music'])
  expect(commitments.reduce((sum, item) => sum + item.amount, 0)).toBe(1945)
})

test('simulates expenses and extra income without mutating the saved plan', () => {
  const plan = { balance: 1000, plannedItems: [], safetyReserve: 200, nextPaymentDate: '2026-09-20', today: '2026-09-15' }
  const expense = simulatePayday(plan, { type: 'expense', amount: 100 })
  const income = simulatePayday(plan, { type: 'income', amount: 300 })

  expect(expense.remainingFree).toBe(700)
  expect(income.remainingFree).toBe(1100)
  expect(plan.todaySpent).toBeUndefined()
  expect(plan.extraIncome).toBeUndefined()
})

test('marks expired and constrained plans safely', () => {
  expect(calculateUntilPayday({ balance: 100, plannedItems: [{ amount: 200 }], safetyReserve: 50, nextPaymentDate: '2026-09-14', today: '2026-09-15' }))
    .toMatchObject({ remainingFree: -150, days: 0, dailyRhythm: 0, weeklyRhythm: 0, status: 'critical', isExpired: true })
})
