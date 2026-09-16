import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { AiProviderRoot } from '../services/ai/AiContext'
import { ReportPage } from './ReportPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
function renderPage(provider) { return render(<FinanceProvider storage={storage()}><AiProviderRoot provider={provider}><MemoryRouter><ReportPage /></MemoryRouter></AiProviderRoot></FinanceProvider>) }

test('renders a local monthly report immediately without calling AI', () => {
  const provider = { generateMonthlyReport: vi.fn() }
  renderPage(provider)
  expect(screen.getByText('Resumo')).toBeVisible()
  expect(screen.getByText('Pontos de atenção')).toBeVisible()
  expect(screen.getByText('Próximos passos')).toBeVisible()
  expect(screen.getByRole('button', { name: /imprimir/i })).toBeVisible()
  expect(screen.getByRole('button', { name: /gerar leitura com ia/i })).toBeVisible()
  expect(provider.generateMonthlyReport).not.toHaveBeenCalled()
})

test('generates an optional consented AI narrative while local totals remain visible', async () => {
  const user = userEvent.setup()
  const provider = { generateMonthlyReport: vi.fn(async () => ({ summary: 'Narrativa mensal personalizada.', attention: ['Atenção personalizada'], nextSteps: ['Passo personalizado'] })) }
  renderPage(provider)
  const localTotal = screen.getByText('Entrou').parentElement.textContent

  await user.click(screen.getByRole('button', { name: /gerar leitura com ia/i }))
  await user.click(screen.getByRole('button', { name: /entendi e aceito/i }))
  await user.click(screen.getByRole('button', { name: /gerar narrativa agora/i }))

  expect(await screen.findByText('Narrativa mensal personalizada.')).toBeVisible()
  expect(screen.getByText('Entrou').parentElement.textContent).toBe(localTotal)
  expect(provider.generateMonthlyReport).toHaveBeenCalledTimes(1)
})
