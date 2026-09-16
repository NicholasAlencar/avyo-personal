import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { UntilPaydayPage } from './UntilPaydayPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

function renderPage() {
  return render(<FinanceProvider storage={storage()}><MemoryRouter><UntilPaydayPage /></MemoryRouter></FinanceProvider>)
}

test('shows daily and weekly rhythm and records what-if changes in the plan', async () => {
  const user = userEvent.setup()
  renderPage()

  expect(screen.getByText(/ritmo diário/i)).toBeVisible()
  expect(screen.getByText(/ritmo semanal/i)).toBeVisible()
  expect(screen.getByText(/gasto hoje/i)).toBeVisible()

  await user.type(screen.getByLabelText(/e se gastar/i), '200')
  expect(screen.getByText(/depois dessa compra/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /registrar gasto/i }))
  expect(screen.getByText(/r\$\s*200,00 gastos hoje/i)).toBeVisible()

  await user.clear(screen.getByLabelText(/e se entrar/i))
  await user.type(screen.getByLabelText(/e se entrar/i), '500')
  await user.click(screen.getByRole('button', { name: /registrar entrada/i }))
  expect(screen.getByText(/r\$\s*500,00 de entradas extras/i)).toBeVisible()
})

test('rebuilds the plan through five wizard stages', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /refazer plano/i }))
  expect(screen.getByText(/etapa 1 de 5/i)).toBeVisible()

  await user.clear(screen.getByLabelText(/saldo disponível/i))
  await user.type(screen.getByLabelText(/saldo disponível/i), '2500')
  await user.click(screen.getByRole('button', { name: /continuar/i }))
  expect(screen.getByText(/etapa 2 de 5/i)).toBeVisible()

  const nextPayment = new Date()
  nextPayment.setDate(nextPayment.getDate() + 10)
  await user.type(screen.getByLabelText(/próximo recebimento/i), nextPayment.toISOString().slice(0, 10))
  await user.click(screen.getByRole('button', { name: /continuar/i }))
  expect(screen.getByText(/etapa 3 de 5/i)).toBeVisible()
  expect(screen.getByText(/compromissos detectados/i)).toBeVisible()

  const commitments = screen.getByRole('group', { name: /compromissos detectados/i })
  expect(within(commitments).getAllByRole('checkbox').length).toBeGreaterThan(0)
  await user.click(screen.getByRole('button', { name: /continuar/i }))
  expect(screen.getByText(/etapa 4 de 5/i)).toBeVisible()

  await user.type(screen.getByLabelText(/reserva de segurança/i), '500')
  await user.click(screen.getByRole('button', { name: /continuar/i }))
  expect(screen.getByText(/etapa 5 de 5/i)).toBeVisible()

  await user.click(screen.getByRole('button', { name: /criar meu ritmo/i }))
  expect(screen.getByText(/ritmo diário/i)).toBeVisible()
})
