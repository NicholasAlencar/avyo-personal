import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'

const remoteAnswer = vi.fn(async () => ({ text: 'remote' }))

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_BASE44_APP_ID', 'public-app-id')
  remoteAnswer.mockClear()
})

test('keeps the default provider local even when a public Base44 app id exists', async () => {
  vi.doMock('./Base44AiProvider', () => ({
    createConfiguredBase44AiProvider: () => ({ answerPlanner: remoteAnswer }),
  }))
  const { AiProviderRoot, useAi } = await import('./AiContext')

  function Probe() {
    const ai = useAi()
    return <button onClick={async () => {
      const result = await ai.answerPlanner({ summary: {} })
      document.body.dataset.aiMode = result.mode
    }}>Consultar</button>
  }

  render(<AiProviderRoot><Probe /></AiProviderRoot>)
  await userEvent.click(screen.getByRole('button', { name: 'Consultar' }))

  expect(remoteAnswer).not.toHaveBeenCalled()
  expect(document.body.dataset.aiMode).toBe('local')
})
