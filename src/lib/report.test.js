import { expect, test } from 'vitest'
import { buildMonthlyReport } from './report'

test('builds a deterministic monthly report from financial facts', () => {
  const report = buildMonthlyReport(
    { income: 5000, expenses: 3200, result: 1800, savingsRate: 36 },
    [{ title: 'Reserva em construção', text: 'Você já cobriu 3 meses.', priority: 70 }],
  )
  expect(report.summary).toMatch(/R\$\s?1\.800/)
  expect(report.attentionPoints[0]).toMatch(/Reserva em construção/)
  expect(report.nextSteps.length).toBeGreaterThan(0)
  expect(JSON.stringify(report)).not.toMatch(/inteligência artificial|IA/i)
})
