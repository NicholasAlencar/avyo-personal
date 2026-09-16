import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { HelpPage } from './HelpPage'

test('filters FAQ and exposes accessible accordion state', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><HelpPage /></MemoryRouter>)

  expect(screen.getByRole('navigation', { name: 'Seções da área' })).toBeVisible()
  await user.type(screen.getByLabelText('Buscar ajuda'), 'dados')
  expect(screen.getByRole('button', { name: 'Onde meus dados ficam?' })).toBeVisible()
  expect(screen.queryByRole('button', { name: 'As projeções são garantidas?' })).not.toBeInTheDocument()

  const question = screen.getByRole('button', { name: 'Onde meus dados ficam?' })
  expect(question).toHaveAttribute('aria-expanded', 'false')
  await user.click(question)
  expect(question).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByText(/somente neste navegador/i)).toBeVisible()
  expect(question).toHaveAttribute('aria-controls')
})
