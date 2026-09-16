import { expect, test } from 'vitest'
import { buildMonthlyReport } from './report'

const finance = {
  income: 7800,
  expenses: 3435,
  result: 4365,
  savingsRate: 55.96,
  spentByCategory: { Moradia: 1850, Alimentação: 640, Saúde: 420, Lazer: 235 },
}

test('builds local narrative and top categories without AI', () => {
  const report = buildMonthlyReport(finance, [
    { title: 'Reserva', text: 'Fortaleça sua proteção.' },
    { title: 'Orçamento', text: 'Revise os gastos flexíveis.' },
  ])

  expect(report.summary).toMatch(/mês fechou/i)
  expect(report.attentionPoints).toHaveLength(2)
  expect(report.nextSteps.length).toBeGreaterThan(0)
  expect(report.topCategories).toEqual([
    { category: 'Moradia', amount: 1850 },
    { category: 'Alimentação', amount: 640 },
    { category: 'Saúde', amount: 420 },
  ])
  expect(JSON.stringify(report)).not.toMatch(/inteligência artificial|\bIA\b/i)
})

test('keeps negative months actionable and deterministic', () => {
  const report = buildMonthlyReport({ ...finance, result: -300, expenses: 8100, savingsRate: -3.8 }, [])
  expect(report.summary).toMatch(/negativo/i)
  expect(report.nextSteps.join(' ')).toMatch(/revise|pause/i)
})
