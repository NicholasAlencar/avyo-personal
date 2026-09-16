import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { NetWorthPage } from './NetWorthPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
const renderPage = () => render(<FinanceProvider storage={storage()}><MemoryRouter><NetWorthPage /></MemoryRouter></FinanceProvider>)

test('recalculates the projected wealth when scenario changes', async () => {
  const user = userEvent.setup()
  renderPage()
  const moderate = screen.getByLabelText('Patrimônio projetado').textContent
  await user.click(screen.getByRole('button', { name: /conservador/i }))
  expect(screen.getByLabelText('Patrimônio projetado').textContent).not.toBe(moderate)
  expect(screen.getByText(/retornos não são garantidos/i)).toBeVisible()
})

test('shows reserve and investments as protected references with links', () => {
  renderPage()
  const reserve = screen.getByRole('region', { name: /referência protegida reserva/i })
  const investments = screen.getByRole('region', { name: /referência protegida investimentos/i })
  expect(within(reserve).getByRole('link', { name: /abrir reserva/i })).toHaveAttribute('href', '/reserva')
  expect(within(investments).getByRole('link', { name: /abrir investimentos/i })).toHaveAttribute('href', '/investimentos')
  expect(within(reserve).getByRole('button', { name: /excluir reserva protegida/i })).toBeDisabled()
  expect(within(investments).getByRole('button', { name: /excluir investimentos protegidos/i })).toBeDisabled()
})

test('adds edits and deletes a patrimonial asset', async () => {
  const user = userEvent.setup()
  renderPage()
  await user.click(screen.getByRole('button', { name: /novo ativo/i }))
  await user.type(screen.getByLabelText('Nome'), 'Notebook pessoal')
  await user.type(screen.getByLabelText('Tipo'), 'Eletrônico')
  await user.type(screen.getByLabelText('Valor'), '5000')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  const row = screen.getByRole('region', { name: /ativo notebook pessoal/i })
  await user.click(within(row).getByRole('button', { name: /editar notebook pessoal/i }))
  const value = screen.getByLabelText('Valor')
  await user.clear(value)
  await user.type(value, '4500')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  await user.click(within(screen.getByRole('region', { name: /ativo notebook pessoal/i })).getByRole('button', { name: /excluir notebook pessoal/i }))
  await user.click(screen.getByRole('button', { name: 'Excluir ativo' }))
  expect(screen.queryByText('Notebook pessoal')).not.toBeInTheDocument()
})
