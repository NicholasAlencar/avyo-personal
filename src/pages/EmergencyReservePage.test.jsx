import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { STORAGE_KEY } from '../data/storage'
import { EmergencyReservePage } from './EmergencyReservePage'

function memoryStorage() {
  const values = new Map([[STORAGE_KEY, JSON.stringify(createInitialState())]])
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

function renderPage() {
  return render(<FinanceProvider storage={memoryStorage()}><MemoryRouter><EmergencyReservePage /></MemoryRouter></FinanceProvider>)
}

test('adds quick deposits to the reserve from a five-option grid', async () => {
  const user = userEvent.setup()
  renderPage()

  for (const amount of ['+ R$ 50', '+ R$ 100', '+ R$ 250', '+ R$ 500', '+ R$ 1.000']) {
    expect(screen.getByRole('button', { name: amount })).toBeVisible()
  }

  await user.click(screen.getByRole('button', { name: '+ R$ 500' }))
  expect(screen.getByText(/13\.100,00 de R\$\s?20\.400,00/i)).toBeVisible()
})

test('edits the independent reserve target', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /editar meta da reserva/i }))
  const months = screen.getByLabelText('Meses de proteção')
  await user.clear(months)
  await user.type(months, '8')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  expect(screen.getByText(/de R\$\s?27\.200,00/i)).toBeVisible()
  expect(screen.getByText(/meta de 8 meses/i)).toBeVisible()
})
