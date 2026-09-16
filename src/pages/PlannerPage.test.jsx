import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { AiProviderRoot } from '../services/ai/AiContext'
import { PlannerPage } from './PlannerPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

function renderPage(provider) {
  return render(<FinanceProvider storage={storage()}><AiProviderRoot provider={provider}><MemoryRouter><PlannerPage /></MemoryRouter></AiProviderRoot></FinanceProvider>)
}

test('organizes financial signals into an actionable timeline before AI activation', () => {
  const provider = { answerPlanner: vi.fn() }
  renderPage(provider)
  expect(screen.getByRole('heading', { name: /seu plano de ação/i })).toBeVisible()
  expect(screen.getByText('Agora')).toBeVisible()
  expect(screen.getByText('Neste mês')).toBeVisible()
  expect(screen.getByText('Depois')).toBeVisible()
  expect(screen.getByRole('button', { name: /ativar planejador com ia/i })).toBeVisible()
  expect(provider.answerPlanner).not.toHaveBeenCalled()
})

test('starts a transient consented AI conversation and can clear the session', async () => {
  const user = userEvent.setup()
  const provider = { answerPlanner: vi.fn(async () => ({ text: 'Priorize o orçamento e preserve sua reserva.', actions: [{ label: 'Revisar orçamento', to: '/planejamento/orcamento' }] })) }
  renderPage(provider)

  await user.click(screen.getByRole('button', { name: /ativar planejador com ia/i }))
  expect(screen.getByLabelText(/privacidade da inteligência artificial/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /entendi e aceito/i }))

  await user.type(screen.getByLabelText('Pergunta para o Planejador'), 'Como organizar melhor este mês?')
  await user.click(screen.getByRole('button', { name: 'Enviar' }))
  expect(await screen.findByText('Priorize o orçamento e preserve sua reserva.')).toBeVisible()
  expect(provider.answerPlanner).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('link', { name: 'Revisar orçamento' })).toHaveAttribute('href', '/planejamento/orcamento')

  await user.click(screen.getByRole('button', { name: /nova sessão/i }))
  expect(screen.queryByText('Priorize o orçamento e preserve sua reserva.')).not.toBeInTheDocument()
})

test('falls back locally when the configured AI provider fails', async () => {
  const user = userEvent.setup()
  const provider = { answerPlanner: vi.fn(async () => { throw new Error('offline') }) }
  renderPage(provider)
  await user.click(screen.getByRole('button', { name: /ativar planejador com ia/i }))
  await user.click(screen.getByRole('button', { name: /entendi e aceito/i }))
  await user.type(screen.getByLabelText('Pergunta para o Planejador'), 'O que faço agora?')
  await user.click(screen.getByRole('button', { name: 'Enviar' }))
  expect(await screen.findByText(/modo local/i)).toBeVisible()
  expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeVisible()
})
