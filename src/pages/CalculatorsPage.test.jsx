import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { CalculatorsPage } from './CalculatorsPage'

test('calculates only after explicit action and keeps learning navigation visible', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><CalculatorsPage /></MemoryRouter>)
  expect(screen.getByRole('navigation', { name: 'Seções da área' })).toBeVisible()
  const card = screen.getByRole('region', { name: /calculadora aporte para uma meta/i })
  expect(within(card).queryByText(/resultado/i)).not.toBeInTheDocument()
  await user.click(within(card).getByRole('button', { name: 'Calcular' }))
  expect(within(card).getByText(/resultado/i)).toBeVisible()
})
