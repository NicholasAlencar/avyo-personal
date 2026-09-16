import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { AiProviderRoot } from '../services/ai/AiContext'
import { PlannerPage } from './PlannerPage'

function createStorage({ aiAccepted = true } = {}) {
  const map = new Map()
  const state = createInitialState()
  state.settings = { aiEnabled: aiAccepted, aiDisclosureAccepted: aiAccepted }
  map.set(STORAGE_KEY, JSON.stringify(state))
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: vi.fn((key, value) => map.set(key, String(value))),
    removeItem: (key) => map.delete(key),
  }
}

function renderPlanner({ provider, storage = createStorage() } = {}) {
  return {
    storage,
    ...render(
      <AiProviderRoot provider={provider}>
        <FinanceProvider storage={storage}>
          <MemoryRouter><PlannerPage /></MemoryRouter>
        </FinanceProvider>
      </AiProviderRoot>,
    ),
  }
}

test('shows four local indicators and suggestion chips', () => {
  renderPlanner({ provider: { answerPlanner: vi.fn() } })
  expect(screen.getByText('Receitas')).toBeVisible()
  expect(screen.getByText('Despesas')).toBeVisible()
  expect(screen.getByText('Resultado')).toBeVisible()
  expect(screen.getByText('Reserva')).toBeVisible()
  expect(screen.getByRole('button', { name: /como organizar o mês/i })).toBeVisible()
})

test('sends sanitized context and labels fallback mode without persisting chat messages', async () => {
  const user = userEvent.setup()
  const answerPlanner = vi.fn().mockRejectedValue(new Error('offline'))
  const { storage } = renderPlanner({ provider: { answerPlanner } })

  await user.type(screen.getByLabelText('Pergunte ao AVYO'), 'Como organizar o mês?')
  await user.click(screen.getByRole('button', { name: 'Enviar' }))

  expect(answerPlanner).toHaveBeenCalledWith(expect.not.objectContaining({ profile: expect.anything() }), expect.objectContaining({ signal: expect.anything() }))
  expect(await screen.findByText('modo local')).toBeVisible()
  expect(screen.getByText('Como organizar o mês?')).toBeVisible()
  expect(storage.setItem).not.toHaveBeenCalled()
})

test('uses local mode immediately when AI sharing is disabled', async () => {
  const user = userEvent.setup()
  const answerPlanner = vi.fn()
  renderPlanner({ provider: { answerPlanner }, storage: createStorage({ aiAccepted: false }) })

  await user.type(screen.getByLabelText('Pergunte ao AVYO'), 'O que priorizo agora?')
  await user.click(screen.getByRole('button', { name: 'Enviar' }))

  expect(answerPlanner).not.toHaveBeenCalled()
  expect(await screen.findByText('modo local')).toBeVisible()
})
