import { createClient } from '@base44/sdk'
import { createAiProvider } from './AiProvider'

const functionNames = {
  planner: 'ai-planner',
  'monthly-report': 'ai-monthly-report',
  'statement-parser': 'ai-statement-parser',
}

export function createBase44AiProvider(client) {
  return createAiProvider({
    invoke: async (capability, input, { signal }) => {
      const response = await client.functions.invoke(functionNames[capability], input, { signal })
      return response?.data ?? response
    },
  })
}

export function createConfiguredBase44AiProvider(appId) {
  if (!appId) return null
  return createBase44AiProvider(createClient({ appId }))
}
