import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { ConnectPage } from './ConnectPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

function renderPage() {
  return render(<FinanceProvider storage={storage()}><MemoryRouter><ConnectPage /></MemoryRouter></FinanceProvider>)
}

test('connects edits and disconnects local business data without losing values', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.clear(screen.getByLabelText(/pró-labore mensal/i))
  await user.type(screen.getByLabelText(/pró-labore mensal/i), '4000')
  await user.clear(screen.getByLabelText(/distribuição de lucros/i))
  await user.type(screen.getByLabelText(/distribuição de lucros/i), '2000')
  await user.clear(screen.getByLabelText(/despesas pessoais pagas pela empresa/i))
  await user.type(screen.getByLabelText(/despesas pessoais pagas pela empresa/i), '500')
  await user.clear(screen.getByLabelText(/patrimônio líquido da empresa/i))
  await user.type(screen.getByLabelText(/patrimônio líquido da empresa/i), '80000')

  await user.click(screen.getByRole('button', { name: 'Conectar dados locais' }))
  expect(screen.getAllByText(/PF \+ PJ/i).length).toBeGreaterThan(0)
  expect(screen.getByText(/R\$\s*80\.000,00/)).toBeVisible()

  await user.clear(screen.getByLabelText(/pró-labore mensal/i))
  await user.type(screen.getByLabelText(/pró-labore mensal/i), '4500')
  await user.click(screen.getByRole('button', { name: /salvar dados locais/i }))
  expect(screen.getByDisplayValue('4500')).toBeVisible()

  await user.click(screen.getByRole('button', { name: 'Desconectar' }))
  expect(screen.getByRole('button', { name: 'Conectar dados locais' })).toBeVisible()
  expect(screen.getByDisplayValue('4500')).toBeVisible()
})

test('states that business data stays local by default', () => {
  renderPage()
  expect(screen.getByText(/não é enviado ao Base44/i)).toBeVisible()
})
