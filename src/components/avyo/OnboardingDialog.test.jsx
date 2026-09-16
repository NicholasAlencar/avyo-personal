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

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>
}

function renderOnboarding(profilePatch = {}) {
  const storage = memoryStorage()
  saveState(storage, {
    ...EMPTY_STATE,
    profile: { ...EMPTY_STATE.profile, ...profilePatch, onboarded: false },
  })
  render(
    <FinanceProvider storage={storage}>
      <MemoryRouter initialEntries={['/']}>
        <OnboardingDialog />
        <LocationProbe />
      </MemoryRouter>
    </FinanceProvider>,
  )
  return storage
}

test('completes three stages and redirects to transactions without requiring name or income', async () => {
  const user = userEvent.setup()
  const storage = renderOnboarding()

  expect(screen.getByText('Boas-vindas ao AVYO')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  expect(screen.getByRole('heading', { name: /organizar/i })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  const essential = screen.getByLabelText('Custo essencial mensal')
  await user.clear(essential)
  await user.type(essential, '3000')
  expect(screen.getByText(/R\$\s*18\.000,00/)).toBeVisible()

  await user.click(screen.getByRole('button', { name: 'Começar' }))
  expect(screen.getByTestId('location')).toHaveTextContent('/movimentacoes/transacoes')

  const saved = JSON.parse(storage.getItem('avyo-personal:v1'))
  expect(saved.profile).toMatchObject({ essentialCost: 3000, monthsGoal: 6, onboarded: true })
})

test('updates the protection preview when cost and months change', async () => {
  const user = userEvent.setup()
  renderOnboarding()

  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.type(screen.getByLabelText('Custo essencial mensal'), '2500')
  await user.selectOptions(screen.getByLabelText('Meses de proteção'), '9')

  expect(screen.getByText(/meta estimada de proteção/i)).toBeVisible()
  expect(screen.getByText(/R\$\s*22\.500,00/)).toBeVisible()
})

test('allows skipping configuration and still marks onboarding complete', async () => {
  const user = userEvent.setup()
  const storage = renderOnboarding()

  await user.click(screen.getByRole('button', { name: 'Pular e configurar depois' }))

  expect(screen.getByTestId('location')).toHaveTextContent('/movimentacoes/transacoes')
  expect(JSON.parse(storage.getItem('avyo-personal:v1')).profile.onboarded).toBe(true)
})
