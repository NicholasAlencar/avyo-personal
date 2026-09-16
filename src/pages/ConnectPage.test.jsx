import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { ConnectPage } from './ConnectPage'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }

test('configures a local PF and PJ view and retains values after disconnecting', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={storage()}><MemoryRouter><ConnectPage /></MemoryRouter></FinanceProvider>)

  await user.type(screen.getByLabelText('Pró-labore mensal'), '3000')
  await user.type(screen.getByLabelText('Distribuição de lucros mensal'), '1500')
  await user.type(screen.getByLabelText('Despesas pessoais pagas pela empresa'), '200')
  await user.type(screen.getByLabelText('Patrimônio líquido da empresa'), '50000')
  await user.click(screen.getByRole('button', { name: /conectar visão empresarial/i }))
  expect(screen.getByText(/visão pf \+ pj ativa/i)).toBeVisible()
  expect(screen.getByText(/patrimônio consolidado/i)).toBeVisible()

  await user.click(screen.getByRole('button', { name: /desconectar empresa/i }))
  expect(screen.getByText(/valores permanecem salvos localmente/i)).toBeVisible()
  expect(screen.getByLabelText('Pró-labore mensal')).toHaveValue(3000)
})
