import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { TransactionsPage } from './TransactionsPage'

function storage(patch = {}) {
  const state = { ...createInitialState(), ...patch }
  const values = new Map([[STORAGE_KEY, JSON.stringify(state)]])
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

function renderPage(patch) {
  return render(<FinanceProvider storage={storage(patch)}><MemoryRouter><TransactionsPage /></MemoryRouter></FinanceProvider>)
}

test('filters transactions by type and category', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.selectOptions(screen.getByLabelText('Tipo'), 'expense')
  expect(screen.queryByText('Salário')).not.toBeInTheDocument()
  expect(screen.getByText('Mercado do bairro')).toBeVisible()

  await user.selectOptions(screen.getByLabelText('Categoria'), 'Alimentação')
  expect(screen.getByText('Mercado do bairro')).toBeVisible()
  expect(screen.queryByText('Aluguel')).not.toBeInTheDocument()
})

test('edits and deletes a transaction', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /Editar Mercado do bairro/i }))
  const description = screen.getByLabelText('Descrição')
  await user.clear(description)
  await user.type(description, 'Mercado semanal')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByText('Mercado semanal')).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Excluir Mercado semanal/i }))
  expect(screen.getByRole('dialog', { name: 'Excluir transação?' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Excluir transação' }))
  expect(screen.queryByText('Mercado semanal')).not.toBeInTheDocument()
})

test('shows a transaction empty state', () => {
  renderPage({ transactions: [] })
  expect(screen.getByRole('heading', { name: 'Nenhuma transação por aqui' })).toBeVisible()
  expect(screen.getAllByRole('button', { name: 'Nova despesa' }).length).toBeGreaterThan(0)
})
