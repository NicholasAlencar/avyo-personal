import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { WealthCalculatorPage } from './WealthCalculatorPage'

test('calculates month/year periods with an extra contribution and comparison scenarios', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><WealthCalculatorPage /></MemoryRouter>)

  const initial = screen.getByLabelText('Valor inicial')
  await user.clear(initial)
  await user.type(initial, '18000')
  const monthly = screen.getByLabelText('Aporte mensal')
  await user.clear(monthly)
  await user.type(monthly, '2500')
  await user.selectOptions(screen.getByLabelText('Unidade do período'), 'months')
  const period = screen.getByLabelText('Período')
  await user.clear(period)
  await user.type(period, '12')
  await user.type(screen.getByLabelText('Aporte extra'), '1000')
  await user.type(screen.getByLabelText('Mês do aporte extra'), '6')

  await user.click(screen.getByRole('button', { name: 'Calcular' }))
  expect(screen.getByLabelText('Patrimônio futuro estimado')).toBeVisible()
  expect(screen.getByText('Cenário 6%')).toBeVisible()
  expect(screen.getByText('Cenário 10%')).toBeVisible()
  expect(screen.getByText('Cenário 15%')).toBeVisible()
  expect(screen.getByText(/projeção não é promessa/i)).toBeVisible()
})
