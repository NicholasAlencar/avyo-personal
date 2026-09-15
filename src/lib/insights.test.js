import { expect, test } from 'vitest'
import { buildInsights, evaluateInsightRules, situationPhrase } from './insights'

test('evaluates every defined insight rule and limits the feed to unique top five', () => {
  const finance = {
    income: 5000, expenses: 5900, result: -900, savingsRate: -18, subsMonthly: 800,
    installmentsMonthly: 900, reservePct: 20, monthsCovered: 1.2, liabilitiesTotal: 40000,
    spentByCategory: { Alimentação: 1400 }, previousSpentByCategory: { Alimentação: 700 },
    overBudget: [{ category: 'Alimentação', spent: 1400, limit: 900 }], cardUtilization: [{ name: 'Principal', utilization: 92 }],
    previousExpenses: 4500, positiveMonthStreak: 3,
  }
  const state = {
    profile: { income: 5000 },
    subscriptions: [{ name: 'Cloud', monthlyValue: 800, active: true, lastUsedDate: '2026-01-01' }],
    atePagamento: { dailyRhythm: 35, remainingFree: 350 },
  }
  const all = evaluateInsightRules(finance, state, new Date('2026-09-15'))
  expect(new Set(all.map((item) => item.id))).toEqual(new Set([
    'category-trend', 'committed-money', 'daily-rhythm', 'over-budget', 'savings-rate', 'reserve',
    'subscriptions-cost', 'card-limit', 'positive-streak', 'expense-rise', 'forgotten-subscription', 'high-debt',
  ]))
  const feed = buildInsights(finance, state, new Date('2026-09-15'))
  expect(feed).toHaveLength(5)
  expect(new Set(feed.map((item) => item.id)).size).toBe(5)
  expect(feed[0].priority).toBeGreaterThanOrEqual(feed[4].priority)
})

test('creates human hero phrases for active plan, surplus and deficit', () => {
  expect(situationPhrase({ result: 800 }, { dailyRhythm: 90, remainingFree: 900 }).title).toMatch(/R\$\s?90/)
  expect(situationPhrase({ result: 800 }, null).title).toMatch(/sobram/)
  expect(situationPhrase({ result: -200 }, null).title).toMatch(/negativo/)
})
