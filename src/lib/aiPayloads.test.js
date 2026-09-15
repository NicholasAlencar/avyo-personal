import { expect, test } from 'vitest'
import { createInitialState } from '../data/seed'
import { buildMonthlyReportPayload, buildPlannerPayload, buildStatementPayload } from './aiPayloads'

test('planner payload contains aggregates but excludes personal names internal ids and notes', () => {
  const state = createInitialState()
  state.profile.email = 'marina@example.com'
  state.investments[0].note = 'informação privada'

  const payload = buildPlannerPayload(state, 'Como reduzir gastos?', [{ role: 'user', text: 'Contexto anterior' }])
  const serialized = JSON.stringify(payload)

  expect(payload.question).toBe('Como reduzir gastos?')
  expect(payload.summary).toMatchObject({ income: 7800, reserve: 12600 })
  expect(payload.summary.categories).toContainEqual({ category: 'Alimentação', amount: 640 })
  expect(serialized).not.toContain('Marina')
  expect(serialized).not.toContain('marina@example.com')
  expect(serialized).not.toContain('tx-salario')
  expect(serialized).not.toContain('informação privada')
})

test('planner payload keeps only the six newest bounded history messages', () => {
  const history = Array.from({ length: 8 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', text: `${index}-${'x'.repeat(900)}` }))
  const payload = buildPlannerPayload(createInitialState(), 'q'.repeat(900), history)

  expect(payload.question).toHaveLength(800)
  expect(payload.history).toHaveLength(6)
  expect(payload.history[0].text.startsWith('2-')).toBe(true)
  expect(payload.history.every((message) => message.text.length <= 800)).toBe(true)
})

test('monthly report payload keeps bounded local facts only', () => {
  const payload = buildMonthlyReportPayload(
    { income: 9000, expenses: 5000, result: 4000, reserve: 12000, netWorth: 80000, spentByCategory: { Moradia: 2500, Lazer: 900, Saúde: 500, Outros: 100 } },
    [{ title: 'Margem positiva', text: 'Você preservou renda.', id: 'private-id', to: '/metas' }],
  )

  expect(payload.topCategories).toEqual([
    { category: 'Moradia', amount: 2500 },
    { category: 'Lazer', amount: 900 },
    { category: 'Saúde', amount: 500 },
  ])
  expect(payload.insights).toEqual([{ title: 'Margem positiva', description: 'Você preservou renda.' }])
  expect(JSON.stringify(payload)).not.toContain('private-id')
})

test('statement payload caps content and normalizes unknown formats', () => {
  const payload = buildStatementPayload('a'.repeat(51000), { format: 'pdf', filename: 'segredo.pdf' })
  expect(payload).toEqual({ text: 'a'.repeat(50000), format: 'text' })
})
