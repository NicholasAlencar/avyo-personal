import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { InstallmentsPage } from './InstallmentsPage'

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
  return render(<FinanceProvider storage={storage(patch)}><MemoryRouter><InstallmentsPage /></MemoryRouter></FinanceProvider>)
}

test('shows future installment total and timeline', () => {
  renderPage()
  expect(screen.getByText('Total futuro')).toBeVisible()
  expect(screen.getByText('R$ 2.300,00')).toBeVisible()
  expect(screen.getAllByText('Próximos meses').length).toBeGreaterThan(0)
})

test('edits and deletes an installment', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /Editar Notebook/i }))
  const description = screen.getByLabelText('Descrição')
  await user.clear(description)
  await user.type(description, 'Notebook trabalho')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByText('Notebook trabalho')).toBeVisible()

  await user.click(screen.getByRole('button', { name: /Excluir Notebook trabalho/i }))
  expect(screen.getByRole('dialog', { name: 'Excluir parcelamento?' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Excluir parcelamento' }))
  expect(screen.queryByText('Notebook trabalho')).not.toBeInTheDocument()
})

test('shows an installment empty state', () => {
  renderPage({ installments: [] })
  expect(screen.getByRole('heading', { name: 'Nenhum parcelamento ativo' })).toBeVisible()
})
