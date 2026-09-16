import { describe, expect, it } from 'vitest'
import { compareAllocation, normalizeAllocation, scoreSuitability } from './investments'

describe('investment suitability', () => {
  it('scores all five dimensions and preserves reasons', () => {
    const result = scoreSuitability({
      tolerance: 2,
      capacity: 3,
      horizon: 4,
      liquidity: 1,
      knowledge: 2,
      reasons: ['aposentadoria'],
      priorities: ['segurança'],
    })

    expect(result).toMatchObject({
      profile: 'equilibrado',
      tolerance: 2,
      capacity: 3,
      horizon: 4,
      reasons: ['aposentadoria'],
      priorities: ['segurança'],
    })
    expect(result.updatedAt).toBeTruthy()
  })
})

describe('investment allocation', () => {
  it('rejects allocation totals other than 100', () => {
    expect(() => normalizeAllocation({ stable: 60, variable: 30 })).toThrow('allocation_total')
  })

  it('normalizes numeric allocation and compares target with current', () => {
    expect(normalizeAllocation({ stable: '50', variable: 30, international: 20 })).toEqual({ stable: 50, variable: 30, international: 20 })
    expect(compareAllocation({ stable: 65, variable: 25, international: 10 }, { stable: 50, variable: 30, international: 20 }))
      .toEqual({ stable: -15, variable: 5, international: 10 })
  })
})
