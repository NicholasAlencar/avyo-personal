import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../../context/FinanceContext'
import { EMPTY_STATE } from '../../data/schema'
import { saveState } from '../../data/storage'
import { OnboardingDialog } from './OnboardingDialog'

function memoryStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

test('collects the essential profile and finishes the first opening', async () => {
  const user = userEvent.setup()
  const storage = memoryStorage()
  saveState(storage, EMPTY_STATE)
  render(<FinanceProvider storage={storage}><OnboardingDialog /></FinanceProvider>)

  expect(screen.getByRole('dialog', { name: /bem-vindo ao avyo/i })).toBeVisible()
  await user.type(screen.getByLabelText(/seu nome/i), 'Marina')
  await user.type(screen.getByLabelText(/renda mensal/i), '7000')
  await user.click(screen.getByRole('button', { name: /continuar/i }))
  await user.type(screen.getByLabelText(/custo essencial/i), '3200')
  await user.click(screen.getByRole('button', { name: /continuar/i }))
  await user.click(screen.getByRole('button', { name: /concluir/i }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(JSON.parse(storage.getItem('avyo-personal:v1')).profile).toMatchObject({ name: 'Marina', income: 7000, essentialCost: 3200, onboarded: true })
})
