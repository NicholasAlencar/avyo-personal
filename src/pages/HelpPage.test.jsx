import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { HelpPage } from './HelpPage'

test('filters and expands FAQ items accessibly', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter><HelpPage /></MemoryRouter>)
  expect(screen.getByRole('navigation', { name: 'Seções da área' })).toBeVisible()
  await user.type(screen.getByLabelText('Buscar ajuda'), 'dados')
  const question = screen.getByRole('button', { name: 'Onde meus dados ficam?' })
  expect(question).toHaveAttribute('aria-expanded', 'false')
  await user.click(question)
  expect(question).toHaveAttribute('aria-expanded', 'true')
  const controls = question.getAttribute('aria-controls')
  expect(document.getElementById(controls)).toBeVisible()
})
