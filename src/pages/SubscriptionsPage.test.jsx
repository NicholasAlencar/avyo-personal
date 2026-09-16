import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { SubscriptionsPage } from './SubscriptionsPage'

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
  return render(<FinanceProvider storage={storage(patch)}><MemoryRouter><SubscriptionsPage /></MemoryRouter></FinanceProvider>)
}

test('shows active monthly and annual subscription totals', () => {
  renderPage()
  expect(screen.getByText('Ativas por mês')).toBeVisible()
  expect(screen.getByText(/191,70/)).toBeVisible()
  expect(screen.getByText('Ativas por ano')).toBeVisible()
  expect(screen.getByText(/2\.300,40/)).toBeVisible()
})

test('shows forgotten subscriptions and records usage today', async () => {
  const user = userEvent.setup()
  renderPage()
  expect(screen.getAllByText(/sem uso há/i).length).toBeGreaterThan(0)
  await user.click(screen.getAllByRole('button', { name: /usou hoje/i })[0])
  expect(screen.getAllByText(/usado hoje/i)[0]).toBeVisible()
})

test('edits and deletes a subscription', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /Editar Spotify/i }))
  const name = screen.getByLabelText('Assinatura')
  await user.clear(name)
  await user.type(name, 'Spotify Duo')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByText('Spotify Duo')).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Excluir Spotify Duo/i }))
  expect(screen.getByRole('dialog', { name: 'Excluir assinatura?' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Excluir assinatura' }))
  expect(screen.queryByText('Spotify Duo')).not.toBeInTheDocument()
})

test('shows a subscription empty state', () => {
  renderPage({ subscriptions: [] })
  expect(screen.getByRole('heading', { name: 'Nenhuma assinatura cadastrada' })).toBeVisible()
})
