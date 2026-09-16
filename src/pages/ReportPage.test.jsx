import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { AiProviderRoot } from '../services/ai/AiContext'
import { ReportPage } from './ReportPage'

function createStorage({ aiAccepted = true } = {}) {
  const map = new Map()
  const state = createInitialState()
  state.settings = { aiEnabled: aiAccepted, aiDisclosureAccepted: aiAccepted }
  map.set(STORAGE_KEY, JSON.stringify(state))
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: (key) => map.delete(key) }
}

function renderPage({ provider, storage = createStorage() } = {}) {
  return render(
    <AiProviderRoot provider={provider}>
      <FinanceProvider storage={storage}>
        <MemoryRouter><ReportPage /></MemoryRouter>
      </FinanceProvider>
    </AiProviderRoot>,
  )
}

test('renders local totals and narrative before any AI call', () => {
  const generateMonthlyReport = vi.fn()
  renderPage({ provider: { generateMonthlyReport } })
  expect(screen.getByText('Resumo')).toBeVisible()
  expect(screen.getByText('Pontos de atenção')).toBeVisible()
  expect(screen.getByText('Próximos passos')).toBeVisible()
  expect(screen.getByText('Principais categorias')).toBeVisible()
  expect(generateMonthlyReport).not.toHaveBeenCalled()
})

test('uses AI only after explicit action and keeps local totals unchanged', async () => {
  const user = userEvent.setup()
  const generateMonthlyReport = vi.fn().mockResolvedValue({ summary: 'Leitura personalizada por IA.', attention: [], nextSteps: ['Mantenha o ritmo.'] })
  renderPage({ provider: { generateMonthlyReport } })

  const localIncome = screen.getByTestId('report-income').textContent
  await user.click(screen.getByRole('button', { name: /gerar leitura com ia/i }))

  expect(generateMonthlyReport).toHaveBeenCalledWith(expect.objectContaining({ totals: expect.any(Object), topCategories: expect.any(Array) }), expect.objectContaining({ signal: expect.anything() }))
  expect(await screen.findByText('Leitura personalizada por IA.')).toBeVisible()
  expect(screen.getByTestId('report-income').textContent).toBe(localIncome)
})

test('keeps the local report when AI is unavailable', async () => {
  const user = userEvent.setup()
  const generateMonthlyReport = vi.fn().mockRejectedValue(new Error('offline'))
  renderPage({ provider: { generateMonthlyReport } })
  const localSummary = screen.getByTestId('report-summary').textContent
  await user.click(screen.getByRole('button', { name: /gerar leitura com ia/i }))
  expect(await screen.findByRole('alert')).toHaveTextContent(/leitura local foi mantida/i)
  expect(screen.getByTestId('report-summary').textContent).toBe(localSummary)
})

test('does not expose an AI action before consent and still prints locally', async () => {
  const user = userEvent.setup()
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  renderPage({ provider: { generateMonthlyReport: vi.fn() }, storage: createStorage({ aiAccepted: false }) })
  expect(screen.queryByRole('button', { name: /gerar leitura com ia/i })).not.toBeInTheDocument()
  expect(screen.getByText(/ative a ia opcional nas configurações/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /imprimir/i }))
  expect(print).toHaveBeenCalledOnce()
  print.mockRestore()
})
