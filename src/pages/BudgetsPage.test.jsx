import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { BudgetsPage } from './BudgetsPage'

function memoryStorage() {
  const values = new Map([[STORAGE_KEY, JSON.stringify(createInitialState())]])
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

function renderPage() {
  return render(<FinanceProvider storage={memoryStorage()}><MemoryRouter><BudgetsPage /></MemoryRouter></FinanceProvider>)
}

test('shows transaction categories even when they do not have a budget yet', () => {
  renderPage()
  expect(screen.getByText('Saúde')).toBeVisible()
  expect(screen.getByText(/sem limite definido/i)).toBeVisible()
  expect(screen.getByRole('button', { name: /criar limite para saúde/i })).toBeVisible()
})

test('edits and deletes an existing budget', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /editar alimentação/i }))
  const limit = screen.getByLabelText('Limite mensal')
  await user.clear(limit)
  await user.type(limit, '1000')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByText(/R\$\s?640,00 de R\$\s?1\.000,00/i)).toBeVisible()

  await user.click(screen.getByRole('button', { name: /excluir alimentação/i }))
  expect(screen.getByRole('dialog', { name: 'Excluir orçamento?' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Excluir orçamento' }))
  expect(screen.getByRole('button', { name: /criar limite para alimentação/i })).toBeVisible()
})
