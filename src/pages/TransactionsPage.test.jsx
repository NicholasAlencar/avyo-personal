import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { TransactionsPage } from './TransactionsPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

test('adds an expense from the transaction dialog', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={storage()}><MemoryRouter><TransactionsPage /></MemoryRouter></FinanceProvider>)
  await user.click(screen.getByRole('button', { name: /nova despesa/i }))
  await user.type(screen.getByLabelText(/descrição/i), 'Livro novo')
  await user.type(screen.getByLabelText(/valor/i), '80')
  await user.click(screen.getByRole('button', { name: /salvar/i }))
  expect(screen.getByText('Livro novo')).toBeVisible()
})
