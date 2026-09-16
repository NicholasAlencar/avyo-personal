import { createClient } from '@base44/sdk'
import { createAiProvider } from './AiProvider'

const functionNames = {
  planner: 'ai-planner',
  'monthly-report': 'ai-monthly-report',
  'statement-parser': 'ai-statement-parser',
}

export function createBase44AiProvider(client) {
  return createAiProvider({
    invoke: (capability, input) => client.functions.invoke(functionNames[capability], input),
  })
}

export function createConfiguredBase44AiProvider(appId) {
  if (!appId) return null
  return createBase44AiProvider(createClient({ appId }))
}
