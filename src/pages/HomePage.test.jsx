import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { HomePage } from './HomePage'

function memoryStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

test('translates demonstration finances into a human dashboard', () => {
  render(<FinanceProvider storage={memoryStorage()}><MemoryRouter><HomePage /></MemoryRouter></FinanceProvider>)
  expect(screen.getByRole('heading', { name: /olá, marina/i })).toBeVisible()
  expect(screen.getByRole('heading', { name: /por dia/i })).toBeVisible()
  expect(screen.getByText('Entrou')).toBeVisible()
  expect(screen.getByText('Saiu')).toBeVisible()
  expect(screen.getByText('Sobrou')).toBeVisible()
  expect(screen.getByText(/saúde financeira/i)).toBeVisible()
  expect(screen.getByRole('region', { name: /insights financeiros/i })).toBeVisible()
})
