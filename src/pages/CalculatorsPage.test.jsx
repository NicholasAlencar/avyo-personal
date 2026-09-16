import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { CalculatorsPage } from './CalculatorsPage'

function renderPage() {
  return render(<MemoryRouter><CalculatorsPage /></MemoryRouter>)
}

test('updates a calculator result only after explicit calculate action', async () => {
  const user = userEvent.setup()
  renderPage()

  expect(screen.getByRole('navigation', { name: 'Seções da área' })).toBeVisible()
  const card = screen.getByRole('region', { name: 'Aporte para uma meta' })
  const initial = card.querySelector('[data-result]')?.textContent
  const value = screen.getByLabelText('Valor da meta')
  await user.clear(value)
  await user.type(value, '2400')
  expect(card.querySelector('[data-result]')?.textContent).toBe(initial)
  await user.click(screen.getByRole('button', { name: 'Calcular aporte para uma meta' }))
  expect(card.querySelector('[data-result]')?.textContent).toMatch(/R\$\s*200,00/)
  expect(screen.getByText(/dividimos o valor pelo prazo/i)).toBeVisible()
})
