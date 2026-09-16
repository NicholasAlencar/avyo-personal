import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { WealthCalculatorPage } from './WealthCalculatorPage'

test('offers 6 10 and 15 percent educational scenarios', async () => {
  const user = userEvent.setup()
  render(<WealthCalculatorPage />)

  expect(screen.getByRole('button', { name: '6%' })).toBeVisible()
  expect(screen.getByRole('button', { name: '10%' })).toBeVisible()
  expect(screen.getByRole('button', { name: '15%' })).toBeVisible()
  expect(screen.getByText(/simulação educativa/i)).toBeVisible()
  expect(screen.getByText(/retornos não são garantidos/i)).toBeVisible()

  const before = screen.getByLabelText(/patrimônio futuro estimado/i).textContent
  await user.click(screen.getByRole('button', { name: '15%' }))
  expect(screen.getByLabelText(/patrimônio futuro estimado/i).textContent).not.toBe(before)
})

test('switches duration between years and months and accepts a variable contribution schedule', async () => {
  const user = userEvent.setup()
  render(<WealthCalculatorPage />)

  expect(screen.getByRole('button', { name: 'Anos' })).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Meses' }))
  expect(screen.getByRole('button', { name: 'Meses' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByLabelText(/^meses$/i)).toBeVisible()

  await user.clear(screen.getByLabelText(/aportes variáveis/i))
  await user.type(screen.getByLabelText(/aportes variáveis/i), '100, 200, 300')
  expect(screen.getByText(/3 valores personalizados/i)).toBeVisible()
})
