import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { SchoolPage } from './SchoolPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

test('opens and completes a lesson with learning subnavigation visible', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={storage()}><MemoryRouter><SchoolPage /></MemoryRouter></FinanceProvider>)
  expect(screen.getByRole('navigation', { name: 'Seções da área' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /reserva antes da pressa/i }))
  expect(screen.getByRole('dialog', { name: /reserva antes da pressa/i })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /marcar como concluída/i }))
  expect(screen.getByText(/5 minutos · concluída/i)).toBeVisible()
})
