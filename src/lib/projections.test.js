import { expect, test } from 'vitest'
import { compareWealthScenarios, projectWealth } from './projections'

test('projects monthly contributions with an effective monthly rate', () => {
  const points = projectWealth({ initial: 10000, monthlyContribution: 1000, annualRate: 0.12, months: 12 })
  expect(points).toHaveLength(13)
  expect(points.at(-1).balance).toBeCloseTo(23846.50, 1)
})

test('handles zero rate without inventing returns', () => {
  expect(projectWealth({ initial: 1000, monthlyContribution: 100, annualRate: 0, months: 2 }).at(-1).balance).toBe(1200)
})

test('adds variable contributions only in their configured month', () => {
  expect(projectWealth({ initial: 1000, monthlyContribution: 100, annualRate: 0, months: 3, extraContributions: [{ month: 2, amount: 500 }] }).at(-1).balance).toBe(1800)
})

test('compares conservative moderate and bold scenarios without promising returns', () => {
  const scenarios = compareWealthScenarios({ initial: 10000, monthlyContribution: 1000, months: 12 })
  expect(scenarios.map((item) => item.label)).toEqual(['Conservador', 'Moderado', 'Arrojado'])
  expect(scenarios[0].final).toBeLessThan(scenarios[2].final)
})
