import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { SubscriptionsPage } from './SubscriptionsPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

test('shows forgotten subscriptions and records usage today', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={storage()}><MemoryRouter><SubscriptionsPage /></MemoryRouter></FinanceProvider>)
  expect(screen.getByText(/sem uso há/i)).toBeVisible()
  await user.click(screen.getAllByRole('button', { name: /usou hoje/i })[0])
  expect(screen.getAllByText(/usado hoje/i)[0]).toBeVisible()
})
