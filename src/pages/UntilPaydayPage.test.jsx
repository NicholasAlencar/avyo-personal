import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { UntilPaydayPage } from './UntilPaydayPage'

function storageWith(overrides = {}) {
  const state = { ...createInitialState(), ...overrides }
  const m = new Map([[STORAGE_KEY, JSON.stringify(state)]])
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }
}

function renderPage(overrides) {
  return render(<FinanceProvider storage={storageWith(overrides)}><MemoryRouter><UntilPaydayPage /></MemoryRouter></FinanceProvider>)
}

test('builds a plan through five wizard stages', async () => {
  const user = userEvent.setup()
  renderPage({ atePagamento: null })

  expect(screen.getByText('Etapa 1 de 5')).toBeVisible()
  await user.type(screen.getByLabelText('Saldo disponível'), '2000')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  expect(screen.getByText('Etapa 2 de 5')).toBeVisible()
  await user.type(screen.getByLabelText('Próximo recebimento'), '2026-10-05')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  expect(screen.getByText('Etapa 3 de 5')).toBeVisible()
  expect(screen.getByRole('heading', { name: /compromissos detectados/i })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  expect(screen.getByText('Etapa 4 de 5')).toBeVisible()
  await user.type(screen.getByLabelText('Reserva de segurança'), '500')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  expect(screen.getByText('Etapa 5 de 5')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Criar meu ritmo' }))
  expect(screen.getAllByText(/ritmo semanal/i).length).toBeGreaterThan(0)
})

test('tracks paid commitments, today spending and records expense/income simulations', async () => {
  const user = userEvent.setup()
  renderPage()

  expect(screen.getAllByText(/ritmo diário/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/ritmo semanal/i).length).toBeGreaterThan(0)

  const commitments = screen.getByRole('region', { name: /compromissos do plano/i })
  await user.click(within(commitments).getByRole('button', { name: /marcar contas restantes como pago/i }))
  expect(within(commitments).getByRole('button', { name: /reabrir contas restantes/i })).toBeVisible()

  const todaySpent = screen.getByLabelText('Gasto hoje')
  await user.clear(todaySpent)
  await user.type(todaySpent, '80')
  expect(screen.getByText(/R\$\s?80,00 gastos hoje/i)).toBeVisible()

  await user.type(screen.getByLabelText('Simular gasto'), '200')
  expect(screen.getByText(/se registrar este gasto/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Registrar gasto no plano' }))
  expect(within(commitments).getByText('Gasto simulado')).toBeVisible()

  await user.type(screen.getByLabelText('Simular renda extra'), '300')
  await user.click(screen.getByRole('button', { name: 'Registrar renda extra' }))
  expect(within(commitments).getByText('Renda extra')).toBeVisible()
})
