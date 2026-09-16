import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { InvestmentsPage } from './InvestmentsPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
const renderPage = () => render(<FinanceProvider storage={storage()}><MemoryRouter><InvestmentsPage /></MemoryRouter></FinanceProvider>)

test('offers seven investment views and completes the suitability quiz', async () => {
  const user = userEvent.setup()
  renderPage()
  expect(screen.getAllByRole('tab')).toHaveLength(7)
  for (const tab of ['Visão geral', 'Minha carteira', 'Encontre meu perfil', 'Distribuição', 'Próximo aporte', 'Objetivos', 'Evolução']) {
    expect(screen.getByRole('tab', { name: tab })).toBeVisible()
  }

  await user.click(screen.getByRole('tab', { name: 'Encontre meu perfil' }))
  await user.selectOptions(screen.getByLabelText('Tolerância a oscilações'), '2')
  await user.selectOptions(screen.getByLabelText('Capacidade financeira'), '3')
  await user.selectOptions(screen.getByLabelText('Horizonte de investimento'), '4')
  await user.selectOptions(screen.getByLabelText('Necessidade de liquidez'), '1')
  await user.selectOptions(screen.getByLabelText('Conhecimento de investimentos'), '2')
  await user.click(screen.getByRole('checkbox', { name: /aposentadoria/i }))
  await user.click(screen.getByRole('button', { name: /calcular meu perfil/i }))
  expect(screen.getByText(/seu perfil é equilibrado/i)).toBeVisible()
  expect(screen.getAllByText(/conteúdo educativo/i).length).toBeGreaterThan(0)
})

test('adds edits and deletes an investment from the portfolio', async () => {
  const user = userEvent.setup()
  renderPage()
  await user.click(screen.getByRole('tab', { name: 'Minha carteira' }))

  await user.click(screen.getByRole('button', { name: /novo investimento/i }))
  await user.type(screen.getByLabelText('Nome'), 'Tesouro Selic')
  await user.type(screen.getByLabelText('Instituição'), 'Tesouro Direto')
  await user.type(screen.getByLabelText('Categoria'), 'Renda fixa')
  await user.type(screen.getByLabelText('Valor aportado'), '1000')
  await user.type(screen.getByLabelText('Valor atual'), '1010')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByText('Tesouro Selic')).toBeVisible()

  const row = screen.getByRole('region', { name: /investimento tesouro selic/i })
  await user.click(within(row).getByRole('button', { name: /editar tesouro selic/i }))
  const current = screen.getByLabelText('Valor atual')
  await user.clear(current)
  await user.type(current, '1050')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  await user.click(within(screen.getByRole('region', { name: /investimento tesouro selic/i })).getByRole('button', { name: /excluir tesouro selic/i }))
  await user.click(screen.getByRole('button', { name: 'Excluir investimento' }))
  expect(screen.queryByText('Tesouro Selic')).not.toBeInTheDocument()
})

test('requires 100 percent allocation and persists investment goals', async () => {
  const user = userEvent.setup()
  renderPage()
  await user.click(screen.getByRole('tab', { name: 'Distribuição' }))
  const stable = screen.getByLabelText('Base estável (%)')
  await user.clear(stable)
  await user.type(stable, '40')
  await user.click(screen.getByRole('button', { name: /salvar distribuição/i }))
  expect(screen.getByText(/precisa somar 100%/i)).toBeVisible()

  await user.click(screen.getByRole('tab', { name: 'Objetivos' }))
  const monthly = screen.getByLabelText('Meta de aporte mensal')
  await user.clear(monthly)
  await user.type(monthly, '1500')
  await user.click(screen.getByRole('button', { name: /salvar objetivos/i }))
  expect(screen.getByText(/R\$\s?1\.500,00 por mês/i)).toBeVisible()
})
