import { expect, test } from 'vitest'
import { calculateUntilPayday } from './untilPayday'

test('calculates free balance and daily rhythm until payment', () => {
  expect(calculateUntilPayday({ balance: 1200, plannedItems: [{ amount: 300 }], safetyReserve: 200, nextPaymentDate: '2026-09-22', today: '2026-09-15' }))
    .toEqual({ remainingFree: 700, days: 7, dailyRhythm: 100, status: 'comfortable', isExpired: false })
})

test('marks expired and constrained plans safely', () => {
  expect(calculateUntilPayday({ balance: 100, plannedItems: [{ amount: 200 }], safetyReserve: 50, nextPaymentDate: '2026-09-14', today: '2026-09-15' }))
    .toMatchObject({ remainingFree: -150, days: 0, dailyRhythm: 0, status: 'critical', isExpired: true })
})
