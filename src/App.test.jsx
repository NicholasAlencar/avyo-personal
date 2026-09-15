import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test } from 'vitest'
import { AppRoutes } from './App'
import { FinanceProvider } from './context/FinanceContext'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
afterEach(cleanup)

test.each([
  ['/', /olá, marina/i], ['/transacoes', /transações/i], ['/orcamento', /orçamento/i], ['/investimentos', /investimentos/i],
  ['/patrimonio', /patrimônio/i], ['/planejador', /seu plano de ação/i], ['/connect', /seus dados, no seu controle/i],
  ['/escola', /escola avyo/i], ['/configuracoes', /configurações/i],
])('renders the page contract for %s', async (path, heading) => {
  render(<FinanceProvider storage={storage()}><MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter></FinanceProvider>)
  expect(await screen.findByRole('heading', { name: heading }, { timeout: 5000 })).toBeVisible()
})

test('turns an unknown route into a useful recovery page', async () => {
  render(<FinanceProvider storage={storage()}><MemoryRouter initialEntries={['/nao-existe']}><AppRoutes /></MemoryRouter></FinanceProvider>)
  expect(await screen.findByRole('heading', { name: /página não encontrada/i }, { timeout: 5000 })).toBeVisible()
})
