import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { AppLayout } from './AppLayout'

test('marks the current navigation item and renders page content', () => {
  render(
    <MemoryRouter initialEntries={['/transacoes']}>
      <AppLayout><p>Conteúdo financeiro</p></AppLayout>
    </MemoryRouter>,
  )

  expect(screen.getAllByRole('link', { name: /transações/i })[0]).toHaveAttribute('aria-current', 'page')
  expect(screen.getByText('Conteúdo financeiro')).toBeVisible()
})
