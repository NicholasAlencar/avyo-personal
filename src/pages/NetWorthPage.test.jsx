import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { NetWorthPage } from './NetWorthPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

test('recalculates the projected wealth when scenario changes', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={storage()}><MemoryRouter><NetWorthPage /></MemoryRouter></FinanceProvider>)
  const moderate = screen.getByLabelText('Patrimônio projetado').textContent
  await user.click(screen.getByRole('button', { name: /conservador/i }))
  expect(screen.getByLabelText('Patrimônio projetado').textContent).not.toBe(moderate)
  expect(screen.getByText(/retornos não são garantidos/i)).toBeVisible()
})
