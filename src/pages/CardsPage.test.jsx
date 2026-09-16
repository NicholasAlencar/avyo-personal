import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { CardsPage } from './CardsPage'

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
  return render(<FinanceProvider storage={storage(patch)}><MemoryRouter><CardsPage /></MemoryRouter></FinanceProvider>)
}

test('shows card commitment and linked installment details', async () => {
  const user = userEvent.setup()
  renderPage()

  expect(screen.getByText('Comprometido em faturas')).toBeVisible()
  expect(screen.getByText(/2\.800,00/)).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Detalhes Ultravioleta/i }))
  expect(screen.getByRole('dialog', { name: 'Detalhes de Ultravioleta' })).toBeVisible()
  expect(screen.getByText('Notebook')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Novo parcelamento neste cartão' })).toBeVisible()
})

test('edits and deletes a card', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /Editar Inter Gold/i }))
  const name = screen.getByLabelText('Nome do cartão')
  await user.clear(name)
  await user.type(name, 'Inter Black')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByText('Inter Black')).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Excluir Inter Black/i }))
  expect(screen.getByRole('dialog', { name: 'Excluir cartão?' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Excluir cartão' }))
  expect(screen.queryByText('Inter Black')).not.toBeInTheDocument()
})

test('shows a card empty state', () => {
  renderPage({ cards: [] })
  expect(screen.getByRole('heading', { name: 'Nenhum cartão cadastrado' })).toBeVisible()
})
