import { expect, test } from 'vitest'
import { projectVariableContributions, projectWealth } from './projections'

test('projects monthly contributions with an effective monthly rate', () => {
  const points = projectWealth({ initial: 10000, monthlyContribution: 1000, annualRate: 0.12, months: 12 })
  expect(points).toHaveLength(13)
  expect(points.at(-1).balance).toBeCloseTo(23846.50, 1)
})

test('handles zero rate without inventing returns', () => {
  expect(projectWealth({ initial: 1000, monthlyContribution: 100, annualRate: 0, months: 2 }).at(-1).balance).toBe(1200)
})

test('projects a schedule of changing monthly contributions', () => {
  const points = projectVariableContributions({ initial: 1000, annualRate: 0.10, months: 3, contributions: [100, 200, 300] })
  expect(points).toHaveLength(4)
  expect(points.at(-1).contributed).toBe(600)
  expect(points.at(-1).balance).toBeGreaterThan(1600)
})

test('repeats the last contribution when schedule is shorter than duration', () => {
  const points = projectVariableContributions({ initial: 0, annualRate: 0, months: 4, contributions: [100, 200] })
  expect(points.at(-1)).toMatchObject({ contributed: 700, balance: 700 })
})
