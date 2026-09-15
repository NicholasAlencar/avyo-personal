import { expect, test } from 'vitest'
import { projectWealth } from './projections'

test('projects monthly contributions with an effective monthly rate', () => {
  const points = projectWealth({ initial: 10000, monthlyContribution: 1000, annualRate: 0.12, months: 12 })
  expect(points).toHaveLength(13)
  expect(points.at(-1).balance).toBeCloseTo(23846.50, 1)
})

test('handles zero rate without inventing returns', () => {
  expect(projectWealth({ initial: 1000, monthlyContribution: 100, annualRate: 0, months: 2 }).at(-1).balance).toBe(1200)
})
