import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { InvestmentsPage } from './InvestmentsPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

function renderPage() {
  return render(<FinanceProvider storage={storage()}><MemoryRouter><InvestmentsPage /></MemoryRouter></FinanceProvider>)
}

test('offers all seven investment views and completes suitability', async () => {
  const user = userEvent.setup()
  renderPage()

  expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
    'Visão geral',
    'Minha carteira',
    'Encontre meu perfil',
    'Distribuição',
    'Próximo aporte',
    'Objetivos',
    'Evolução',
  ])

  await user.click(screen.getByRole('tab', { name: 'Encontre meu perfil' }))
  await user.selectOptions(screen.getByLabelText(/tolerância a oscilações/i), '1')
  await user.selectOptions(screen.getByLabelText(/capacidade financeira/i), '1')
  await user.selectOptions(screen.getByLabelText(/horizonte de investimento/i), '1')
  await user.selectOptions(screen.getByLabelText(/necessidade de liquidez/i), '1')
  await user.selectOptions(screen.getByLabelText(/conhecimento sobre investimentos/i), '1')
  await user.click(screen.getByRole('button', { name: /calcular meu perfil/i }))
  expect(screen.getByText(/seu perfil é conservador/i)).toBeVisible()
})

test('enforces 100 percent allocation and saves local investment goals', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('tab', { name: 'Distribuição' }))
  const stable = screen.getByLabelText(/renda fixa/i)
  await user.clear(stable)
  await user.type(stable, '40')
  await user.click(screen.getByRole('button', { name: /salvar distribuição/i }))
  expect(screen.getByRole('alert')).toHaveTextContent(/100%/i)

  await user.click(screen.getByRole('tab', { name: 'Objetivos' }))
  const monthly = screen.getByLabelText(/meta mensal de aportes/i)
  await user.clear(monthly)
  await user.type(monthly, '1500')
  await user.click(screen.getByRole('button', { name: /salvar objetivos/i }))
  expect(screen.getByText(/r\$\s*1\.500,00 por mês/i)).toBeVisible()
})

test('adds and removes investments from the local portfolio', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('tab', { name: 'Minha carteira' }))
  await user.click(screen.getByRole('button', { name: /adicionar investimento/i }))
  await user.type(screen.getByLabelText(/^nome$/i), 'Tesouro Selic 2029')
  await user.type(screen.getByLabelText(/instituição/i), 'Tesouro Direto')
  await user.selectOptions(screen.getByLabelText(/categoria/i), 'Renda fixa')
  await user.type(screen.getByLabelText(/valor aportado/i), '2000')
  await user.type(screen.getByLabelText(/valor atual/i), '2050')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  expect(screen.getByText('Tesouro Selic 2029')).toBeVisible()
  await user.click(screen.getByRole('button', { name: /excluir tesouro selic 2029/i }))
  await user.click(screen.getByRole('button', { name: /^excluir$/i }))
  expect(screen.queryByText('Tesouro Selic 2029')).not.toBeInTheDocument()
})
