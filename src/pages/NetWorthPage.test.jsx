import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { NetWorthPage } from './NetWorthPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

function renderPage() {
  return render(<FinanceProvider storage={storage()}><MemoryRouter><NetWorthPage /></MemoryRouter></FinanceProvider>)
}

test('composes protected reserve and investment rows into net worth', () => {
  renderPage()

  expect(screen.getByText(/ativos\s*−\s*passivos\s*=\s*patrimônio líquido/i)).toBeVisible()
  expect(screen.getByRole('link', { name: /reserva de emergência/i })).toHaveAttribute('href', '/reserva')
  expect(screen.getByRole('link', { name: /^investimentos$/i })).toHaveAttribute('href', '/investimentos')
  expect(screen.getByRole('button', { name: /excluir reserva de emergência/i })).toBeDisabled()
  expect(screen.getByRole('button', { name: /excluir investimentos/i })).toBeDisabled()
})

test('adds, edits and deletes ordinary assets locally', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /adicionar ativo/i }))
  await user.type(screen.getByLabelText(/^nome$/i), 'Notebook pessoal')
  await user.type(screen.getByLabelText(/^tipo$/i), 'Eletrônico')
  await user.type(screen.getByLabelText(/^valor$/i), '6000')
  await user.click(screen.getByRole('button', { name: /^salvar$/i }))
  expect(screen.getByText('Notebook pessoal')).toBeVisible()

  await user.click(screen.getByRole('button', { name: /editar notebook pessoal/i }))
  const value = screen.getByLabelText(/^valor$/i)
  await user.clear(value)
  await user.type(value, '5500')
  await user.click(screen.getByRole('button', { name: /^salvar$/i }))
  expect(screen.getByText(/r\$\s*5\.500,00/i)).toBeVisible()

  await user.click(screen.getByRole('button', { name: /excluir notebook pessoal/i }))
  await user.click(screen.getByRole('button', { name: /^excluir$/i }))
  expect(screen.queryByText('Notebook pessoal')).not.toBeInTheDocument()
})

test('recalculates the projected wealth when scenario changes', async () => {
  const user = userEvent.setup()
  renderPage()
  const moderate = screen.getByLabelText('Patrimônio projetado').textContent
  await user.click(screen.getByRole('button', { name: /6%/i }))
  expect(screen.getByLabelText('Patrimônio projetado').textContent).not.toBe(moderate)
  expect(screen.getByText(/retornos não são garantidos/i)).toBeVisible()
})
