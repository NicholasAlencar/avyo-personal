import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { InvestmentsPage } from './InvestmentsPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

test('offers five investment views and completes the suitability quiz', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={storage()}><MemoryRouter><InvestmentsPage /></MemoryRouter></FinanceProvider>)
  expect(screen.getAllByRole('tab')).toHaveLength(5)
  await user.click(screen.getByRole('tab', { name: 'Perfil' }))
  await user.click(screen.getByRole('button', { name: /proteger primeiro/i }))
  expect(screen.getByText(/seu perfil é conservador/i)).toBeVisible()
})
