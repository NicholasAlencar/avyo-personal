import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { GoalsPage } from './GoalsPage'

function memoryStorage() {
  const values = new Map([[STORAGE_KEY, JSON.stringify(createInitialState())]])
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

function renderPage() {
  return render(<FinanceProvider storage={memoryStorage()}><MemoryRouter><GoalsPage /></MemoryRouter></FinanceProvider>)
}

test('adds quick deposits to a goal', async () => {
  const user = userEvent.setup()
  renderPage()

  const trip = screen.getByRole('region', { name: /meta viagem para o chile/i })
  expect(within(trip).getByRole('button', { name: '+ R$ 50' })).toBeVisible()
  expect(within(trip).getByRole('button', { name: '+ R$ 100' })).toBeVisible()
  expect(within(trip).getByRole('button', { name: '+ R$ 500' })).toBeVisible()

  await user.click(within(trip).getByRole('button', { name: '+ R$ 100' }))
  expect(within(trip).getByText(/3\.700,00 guardados/i)).toBeVisible()
})

test('edits and deletes a goal', async () => {
  const user = userEvent.setup()
  renderPage()

  const trip = screen.getByRole('region', { name: /meta viagem para o chile/i })
  await user.click(within(trip).getByRole('button', { name: /editar viagem para o chile/i }))
  const name = screen.getByLabelText('Nome da meta')
  await user.clear(name)
  await user.type(name, 'Viagem dos sonhos')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  const edited = screen.getByRole('region', { name: /meta viagem dos sonhos/i })
  expect(edited).toBeVisible()
  await user.click(within(edited).getByRole('button', { name: /excluir viagem dos sonhos/i }))
  expect(screen.getByRole('dialog', { name: 'Excluir meta?' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Excluir meta' }))
  expect(screen.queryByRole('region', { name: /meta viagem dos sonhos/i })).not.toBeInTheDocument()
})
