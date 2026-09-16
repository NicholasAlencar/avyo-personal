import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { ConnectPage } from './ConnectPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

function renderPage() {
  return render(<FinanceProvider storage={storage()}><MemoryRouter><ConnectPage /></MemoryRouter></FinanceProvider>)
}

test('keeps AVYO Connect blocked until the real AVYO Empresas backend exists', () => {
  renderPage()

  expect(screen.getByRole('heading', { name: /seus dados, no seu controle/i })).toBeVisible()
  expect(screen.getByText(/integração com o AVYO Empresas ainda não está disponível/i)).toBeVisible()
  expect(screen.getByRole('button', { name: /conectar AVYO Empresas/i })).toBeDisabled()
})

test('does not simulate a local company connection', () => {
  renderPage()

  expect(screen.queryByLabelText(/pró-labore mensal/i)).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/distribuição de lucros/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/dados locais conectados/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/visão consolidada local/i)).not.toBeInTheDocument()
  expect(screen.getByText(/não simulamos uma conexão local/i)).toBeVisible()
})
