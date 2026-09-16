import { expect, test } from 'vitest'
import { createBase44AiProvider } from './Base44AiProvider'

function recordingClient() {
  const calls = []
  return {
    calls,
    functions: {
      invoke: async (name, input) => {
        calls.push({ name, input })
        return { name, input }
      },
    },
  }
}

test('maps the public AI interface to exactly three Base44 functions', async () => {
  const client = recordingClient()
  const provider = createBase44AiProvider(client)

  const planner = await provider.answerPlanner({ question: 'Oi' })
  const report = await provider.generateMonthlyReport({ totals: {} })
  const statement = await provider.parseStatement({ text: 'data' })

  expect([planner.name, report.name, statement.name]).toEqual(['ai-planner', 'ai-monthly-report', 'ai-statement-parser'])
  expect(client.calls.map(({ name }) => name)).toEqual(['ai-planner', 'ai-monthly-report', 'ai-statement-parser'])
})
