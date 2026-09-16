import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../../context/FinanceContext'
import { EMPTY_STATE } from '../../data/schema'
import { saveState } from '../../data/storage'
import { OnboardingDialog } from './OnboardingDialog'

function memoryStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}
function LocationProbe() { const location = useLocation(); return <span data-testid="location">{location.pathname}</span> }
function renderOnboarding(storage) { return render(<FinanceProvider storage={storage}><MemoryRouter initialEntries={['/']}><OnboardingDialog /><LocationProbe /></MemoryRouter></FinanceProvider>) }

test('completes three optional stages with a live protection preview', async () => {
  const user = userEvent.setup()
  const storage = memoryStorage()
  saveState(storage, EMPTY_STATE)
  renderOnboarding(storage)

  expect(screen.getByRole('dialog', { name: /bem-vindo ao avyo/i })).toBeVisible()
  expect(screen.getByText(/passo 1 de 3/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /continuar/i }))

  expect(screen.getByText(/passo 2 de 3/i)).toBeVisible()
  const essential = await screen.findByLabelText(/custo essencial mensal/i)
  await user.type(essential, '3200')
  const reserve = screen.getByLabelText(/reserva atual/i)
  await user.clear(reserve)
  await user.type(reserve, '6400')
  expect(screen.getByText(/2\.0 meses protegidos/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /continuar/i }))

  expect(screen.getByText(/passo 3 de 3/i)).toBeVisible()
  await screen.findByLabelText(/dia do recebimento/i)
  await user.click(screen.getByRole('button', { name: /concluir/i }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByTestId('location')).toHaveTextContent('/movimentacoes/transacoes')
  expect(JSON.parse(storage.getItem('avyo-personal:v1')).profile).toMatchObject({ essentialCost: 3200, reserveAmount: 6400, onboarded: true })
})

test('can skip onboarding without requiring name or income', async () => {
  const user = userEvent.setup()
  const storage = memoryStorage()
  saveState(storage, EMPTY_STATE)
  renderOnboarding(storage)
  await user.click(screen.getByRole('button', { name: /pular por agora/i }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByTestId('location')).toHaveTextContent('/movimentacoes/transacoes')
  expect(JSON.parse(storage.getItem('avyo-personal:v1')).profile.onboarded).toBe(true)
})
