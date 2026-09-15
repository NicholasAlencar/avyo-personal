import { expect, test, vi } from 'vitest'
import { AiProviderError, createAiProvider } from './AiProvider'
import { localAiFallback } from './LocalAiFallback'

test('provider maps public methods to the three fixed capabilities', async () => {
  const invoke = vi.fn(async (capability) => ({ capability }))
  const provider = createAiProvider({ invoke })

  await expect(provider.answerPlanner({})).resolves.toEqual({ capability: 'planner' })
  await expect(provider.generateMonthlyReport({})).resolves.toEqual({ capability: 'monthly-report' })
  await expect(provider.parseStatement({})).resolves.toEqual({ capability: 'statement-parser' })
})

test('provider aborts a slow request and returns a stable timeout error', async () => {
  const invoke = (_capability, _input, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
  const provider = createAiProvider({ invoke, timeoutMs: 5 })

  await expect(provider.answerPlanner({ question: 'Oi' })).rejects.toEqual(expect.objectContaining({
    name: 'AiProviderError',
    code: 'timeout',
    message: 'A IA demorou mais que o esperado.',
  }))
})

test('provider preserves explicit cancellation as a cancelled error', async () => {
  const controller = new AbortController()
  const invoke = (_capability, _input, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
  const provider = createAiProvider({ invoke, timeoutMs: 1000 })
  const pending = provider.answerPlanner({}, { signal: controller.signal })
  controller.abort()

  await expect(pending).rejects.toEqual(expect.objectContaining({ code: 'cancelled' }))
})

test('local statement fallback parses recognizable CSV without a remote dependency', async () => {
  const result = await localAiFallback.parseStatement({ text: 'data;descricao;valor\n15/09/2026;Mercado;-42,50' })
  expect(result.mode).toBe('local')
  expect(result.rows).toEqual([{ date: '2026-09-15', description: 'Mercado', amount: 42.5, type: 'expense', category: 'Alimentação', recurring: false }])
})

test('AiProviderError retains its machine-readable code', () => {
  expect(new AiProviderError('unavailable', 'Indisponível')).toMatchObject({ code: 'unavailable', message: 'Indisponível' })
})
