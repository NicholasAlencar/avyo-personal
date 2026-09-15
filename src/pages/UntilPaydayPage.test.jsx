import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { UntilPaydayPage } from './UntilPaydayPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

test('shows the daily rhythm and recalculates a simulated purchase', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={storage()}><MemoryRouter><UntilPaydayPage /></MemoryRouter></FinanceProvider>)
  expect(screen.getByText(/ritmo diário/i)).toBeVisible()
  await user.type(screen.getByLabelText(/e se gastar/i), '200')
  expect(screen.getByText(/depois dessa compra/i)).toBeVisible()
})
