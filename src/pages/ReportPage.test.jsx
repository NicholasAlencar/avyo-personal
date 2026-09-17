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

test('renders local totals and narrative without an AI call', () => {
  const generateMonthlyReport = vi.fn()
  renderPage({ provider: { generateMonthlyReport } })
  expect(screen.getByText('Resumo')).toBeVisible()
  expect(screen.getByText('Pontos de atenção')).toBeVisible()
  expect(screen.getByText('Próximos passos')).toBeVisible()
  expect(screen.getByText('Principais categorias')).toBeVisible()
  expect(generateMonthlyReport).not.toHaveBeenCalled()
})

test('does not expose a remote AI action and still prints locally', async () => {
  const user = userEvent.setup()
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  renderPage({ provider: { generateMonthlyReport: vi.fn() }, storage: createStorage({ aiAccepted: false }) })
  expect(screen.queryByRole('button', { name: /gerar leitura com ia/i })).not.toBeInTheDocument()
  expect(screen.getByText(/leitura 100% local/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /imprimir/i }))
  expect(print).toHaveBeenCalledOnce()
  print.mockRestore()
})
