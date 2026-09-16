import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { HomePage } from './HomePage'

function memoryStorage() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }
}

test('translates demonstration finances into the complete AVYO home dashboard', () => {
  render(<FinanceProvider storage={memoryStorage()}><MemoryRouter><HomePage /></MemoryRouter></FinanceProvider>)

  expect(screen.getByRole('heading', { name: /olá, marina/i })).toBeVisible()
  expect(screen.getByRole('region', { name: /sua situação financeira/i })).toBeVisible()
  expect(screen.getByText(/livre até receber/i)).toBeVisible()
  expect(screen.getByRole('heading', { name: /AVYO Pulse — \d+\/100/i })).toBeVisible()

  for (const label of ['Resultado', 'Renda', 'Despesas', 'Proteção', 'Patrimônio']) {
    expect(screen.getByText(label)).toBeVisible()
  }

  for (const journey of ['Organizar', 'Proteger e planejar', 'Crescer']) {
    expect(screen.getByRole('heading', { name: journey })).toBeVisible()
  }

  expect(screen.getByRole('link', { name: /ver plano até receber/i })).toBeVisible()
  expect(screen.queryByText(/monte seu plano até receber/i)).not.toBeInTheDocument()
})
