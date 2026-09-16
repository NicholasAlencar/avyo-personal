import { describe, expect, test } from 'vitest'
import {
  PLANNER_RESPONSE_SCHEMA,
  REPORT_RESPONSE_SCHEMA,
  STATEMENT_RESPONSE_SCHEMA,
  buildPlannerPrompt,
  validatePlannerPayload,
  validateReportPayload,
  validateStatementPayload,
} from './contracts'
import { createAiFunction } from './runtime'

const plannerPayload = {
  question: 'Como organizar o mês?',
  history: [{ role: 'user', text: 'Quero reduzir gastos.' }],
  summary: {
    income: 7800,
    expenses: 3435,
    remainder: 4365,
    commitments: 452,
    reserve: 12600,
    netWorth: 47400,
    categories: [{ category: 'Moradia', amount: 1850 }],
  },
}

describe('Base44 AI payload contracts', () => {
  test('accepts the bounded planner payload and rejects unknown personal fields', () => {
    expect(validatePlannerPayload(plannerPayload)).toEqual(plannerPayload)
    expect(() => validatePlannerPayload({ ...plannerPayload, email: 'private@example.com' })).toThrowError(expect.objectContaining({ code: 'invalid_payload' }))
  })

  test('rejects planner questions and histories beyond their limits', () => {
    expect(() => validatePlannerPayload({ ...plannerPayload, question: 'x'.repeat(801) })).toThrowError(expect.objectContaining({ code: 'invalid_payload' }))
    expect(() => validatePlannerPayload({ ...plannerPayload, history: Array(7).fill({ role: 'user', text: 'x' }) })).toThrowError(expect.objectContaining({ code: 'invalid_payload' }))
  })

  test('accepts only report aggregates and three top categories', () => {
    const payload = {
      totals: { income: 9000, expenses: 5000, result: 4000, reserve: 12000, netWorth: 80000 },
      topCategories: [{ category: 'Moradia', amount: 2500 }],
      insights: [{ title: 'Margem positiva', description: 'O mês ficou positivo.' }],
    }
    expect(validateReportPayload(payload)).toEqual(payload)
    expect(() => validateReportPayload({ ...payload, topCategories: Array(4).fill(payload.topCategories[0]) })).toThrowError(expect.objectContaining({ code: 'invalid_payload' }))
  })

  test('caps statement text and only accepts declared formats', () => {
    expect(validateStatementPayload({ text: 'OFXDATA', format: 'ofx' })).toEqual({ text: 'OFXDATA', format: 'ofx' })
    expect(() => validateStatementPayload({ text: 'x'.repeat(50001), format: 'text' })).toThrowError(expect.objectContaining({ code: 'invalid_payload' }))
    expect(() => validateStatementPayload({ text: 'data', format: 'pdf' })).toThrowError(expect.objectContaining({ code: 'invalid_payload' }))
  })
})

describe('Base44 AI response contracts', () => {
  test('schemas are closed and cap all generated collections', () => {
    expect(PLANNER_RESPONSE_SCHEMA).toMatchObject({ additionalProperties: false, required: ['text', 'facts', 'actions'] })
    expect(PLANNER_RESPONSE_SCHEMA.properties.facts.maxItems).toBe(5)
    expect(PLANNER_RESPONSE_SCHEMA.properties.actions.maxItems).toBe(3)
    expect(REPORT_RESPONSE_SCHEMA).toMatchObject({ additionalProperties: false, required: ['summary', 'attention', 'nextSteps'] })
    expect(STATEMENT_RESPONSE_SCHEMA.properties.rows.maxItems).toBe(500)
  })

  test('planner prompt contains the mandatory educational safety boundary', () => {
    const prompt = buildPlannerPrompt(plannerPayload)
    expect(prompt).toContain('Não movimente dinheiro')
    expect(prompt).toContain('não prometa retorno')
    expect(prompt).toContain('educacional')
  })
})

describe('stateless Base44 function runtime', () => {
  test('invokes only Core.InvokeLLM and returns its structured result', async () => {
    const handler = createAiFunction({
      validatePayload: (value) => value,
      buildPrompt: ({ question }) => `Pergunta: ${question}`,
      responseSchema: PLANNER_RESPONSE_SCHEMA,
      maxBytes: 1000,
      getClient: () => ({ integrations: { Core: { InvokeLLM: async ({ prompt }) => ({ text: prompt, facts: [], actions: [] }) } } }),
    })
    const response = await handler(new Request('https://example.test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: 'Olá' }) }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ text: 'Pergunta: Olá', facts: [], actions: [] })
  })

  test.each([
    ['GET', undefined, 405, 'method_not_allowed'],
    ['POST', { headers: { 'content-type': 'text/plain' }, body: '{}' }, 415, 'invalid_content_type'],
    ['POST', { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ value: 'too large' }) }, 413, 'payload_too_large'],
  ])('rejects invalid HTTP request %s', async (method, init, status, code) => {
    const handler = createAiFunction({ validatePayload: (value) => value, buildPrompt: String, responseSchema: {}, maxBytes: 10, getClient: () => ({}) })
    const response = await handler(new Request('https://example.test', { method, ...init }))
    expect(response.status).toBe(status)
    expect(await response.json()).toEqual({ error: code })
  })

  test('maps invalid payloads to 400 without exposing details', async () => {
    const error = Object.assign(new Error('contains private implementation detail'), { code: 'invalid_payload' })
    const handler = createAiFunction({ validatePayload: () => { throw error }, buildPrompt: String, responseSchema: {}, maxBytes: 100, getClient: () => ({}) })
    const response = await handler(new Request('https://example.test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'invalid_payload' })
  })
})
