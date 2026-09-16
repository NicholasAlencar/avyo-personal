import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, expect, test } from 'vitest'
import { AppRoutes } from './App'
import { FinanceProvider } from './context/FinanceContext'

const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
afterEach(cleanup)

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>
}

function renderRoute(path) {
  return render(<FinanceProvider storage={storage()}><MemoryRouter initialEntries={[path]}><AppRoutes /><LocationProbe /></MemoryRouter></FinanceProvider>)
}

test.each([
  ['/', /olá, marina/i],
  ['/movimentacoes/transacoes', /transações/i],
  ['/movimentacoes/cartoes', /cartões/i],
  ['/movimentacoes/parcelamentos', /parcelamentos/i],
  ['/movimentacoes/assinaturas', /assinaturas/i],
  ['/planejamento/orcamento', /orçamento/i],
  ['/planejamento/metas', /metas/i],
  ['/reserva', /reserva/i],
  ['/ate-pagamento', /até/i],
  ['/investimentos', /investimentos/i],
  ['/patrimonio', /patrimônio/i],
  ['/patrimonio/calculadora', /calculadora.*patrimônio|patrimônio.*calculadora/i],
  ['/planejador', /meu planejador/i],
  ['/connect', /seus dados, no seu controle/i],
  ['/aprender/escola', /escola avyo/i],
  ['/aprender/calculadoras', /calculadoras/i],
  ['/aprender/ajuda', /ajuda/i],
  ['/relatorio', /relatório do mês/i],
  ['/configuracoes', /configurações/i],
])('renders the page contract for %s', async (path, heading) => {
  renderRoute(path)
  expect(await screen.findByRole('heading', { name: heading }, { timeout: 5000 })).toBeVisible()
})

test.each([
  ['/transacoes', '/movimentacoes/transacoes', /transações/i],
  ['/cartoes', '/movimentacoes/cartoes', /cartões/i],
  ['/parcelamentos', '/movimentacoes/parcelamentos', /parcelamentos/i],
  ['/assinaturas', '/movimentacoes/assinaturas', /assinaturas/i],
  ['/orcamento', '/planejamento/orcamento', /orçamento/i],
  ['/metas', '/planejamento/metas', /metas/i],
  ['/escola', '/aprender/escola', /escola avyo/i],
  ['/calculadoras', '/aprender/calculadoras', /calculadoras/i],
  ['/ajuda', '/aprender/ajuda', /ajuda/i],
])('redirects legacy route %s to %s', async (legacy, canonical, heading) => {
  renderRoute(legacy)
  expect(await screen.findByRole('heading', { name: heading }, { timeout: 5000 })).toBeVisible()
  expect(screen.getByTestId('location')).toHaveTextContent(canonical)
})

test('turns an unknown route into a useful recovery page', async () => {
  renderRoute('/nao-existe')
  expect(await screen.findByRole('heading', { name: /página não encontrada/i }, { timeout: 5000 })).toBeVisible()
})
