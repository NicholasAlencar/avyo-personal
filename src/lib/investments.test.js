import { expect, test } from 'vitest'
import { compareAllocation, normalizeAllocation, scoreSuitability } from './investments'

test('scores all five suitability dimensions and preserves reasons', () => {
  const result = scoreSuitability({ tolerance: 2, capacity: 3, horizon: 4, liquidity: 1, knowledge: 2, reasons: ['aposentadoria'], priorities: ['segurança'] })
  expect(result).toMatchObject({ profile: 'equilibrado', tolerance: 2, capacity: 3, horizon: 4, reasons: ['aposentadoria'], priorities: ['segurança'] })
})

test('maps low and high suitability scores to conservative and bold profiles', () => {
  expect(scoreSuitability({ tolerance: 1, capacity: 1, horizon: 1, liquidity: 1, knowledge: 1 }).profile).toBe('conservador')
  expect(scoreSuitability({ tolerance: 4, capacity: 4, horizon: 4, liquidity: 4, knowledge: 4 }).profile).toBe('arrojado')
})

test('rejects allocation totals other than 100', () => {
  expect(() => normalizeAllocation({ stable: 60, variable: 30 })).toThrow('allocation_total')
  expect(normalizeAllocation({ stable: 60, variable: 40 })).toEqual({ stable: 60, variable: 40 })
})

test('compares current and desired allocation by category', () => {
  expect(compareAllocation({ stable: 70, variable: 30 }, { stable: 50, variable: 50 })).toEqual([
    { category: 'stable', current: 70, desired: 50, difference: -20 },
    { category: 'variable', current: 30, desired: 50, difference: 20 },
  ])
})
