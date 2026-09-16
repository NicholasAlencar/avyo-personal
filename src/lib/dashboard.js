import { aggregateFinance } from './finance'
import { calculateUntilPayday } from './untilPayday'

const money = (value) => Math.round(Number(value || 0) * 100) / 100

function activePaydayItems(plan) {
  const paid = new Set(plan?.paidItemIds || [])
  return [...(plan?.plannedItems || []), ...(plan?.extraItems || [])].filter((item) => !paid.has(item.id))
}

function buildSituation(state, finance) {
  const plan = state.atePagamento?.status === 'active' ? state.atePagamento : null
  if (!plan) {
    return {
      total: finance.result,
      committed: 0,
      free: finance.result,
      dailyRhythm: null,
      days: 0,
      hasPlan: false,
      title: finance.result >= 0 ? 'Seu mês está no positivo' : 'Seu mês pede ajuste',
      detail: finance.result >= 0
        ? 'O resultado do mês está livre para você decidir o próximo passo.'
        : 'As saídas passaram das entradas neste mês. Vale revisar o que ainda pode ser ajustado.',
    }
  }

  const plannedItems = activePaydayItems(plan)
  const plannedCommitted = plannedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const safetyReserve = Number(plan.safetyReserve || 0)
  const calculation = calculateUntilPayday({ ...plan, plannedItems })
  const free = money(calculation.remainingFree)

  return {
    total: money(plan.balance),
    committed: money(plannedCommitted + safetyReserve),
    free,
    dailyRhythm: money(calculation.dailyRhythm),
    days: calculation.days,
    status: calculation.status,
    hasPlan: true,
    title: free >= 0 ? 'Seu dinheiro até o próximo recebimento está mapeado' : 'Seu plano até receber precisa de ajuste',
    detail: free >= 0
      ? `${calculation.days} dias pela frente com compromissos e proteção já considerados.`
      : 'Os compromissos previstos ultrapassam o valor disponível. Revise o plano antes de assumir novas despesas.',
  }
}

function buildPulse(finance) {
  const score = Math.round(Number(finance.healthScore || 0))
  const label = score >= 80 ? 'Muito saudável' : score >= 60 ? 'Em evolução' : 'Pede atenção'

  let cta
  if (finance.reservePct < 100) cta = { label: 'Fortalecer reserva', to: '/reserva' }
  else if (finance.overBudget.length) cta = { label: 'Revisar orçamento', to: '/planejamento/orcamento' }
  else if (finance.result < 0) cta = { label: 'Revisar movimentações', to: '/movimentacoes/transacoes' }
  else cta = { label: 'Planejar próximo passo', to: '/planejador' }

  return { score, label, cta }
}

function buildFiveIndicators(finance) {
  return [
    {
      key: 'result',
      label: 'Resultado',
      value: finance.result,
      helper: finance.result >= 0 ? 'Entradas menos saídas no mês' : 'Mês com resultado negativo',
      tone: finance.result >= 0 ? 'positive' : 'negative',
    },
    {
      key: 'income',
      label: 'Renda',
      value: finance.income,
      helper: 'Total que entrou neste mês',
      tone: 'positive',
    },
    {
      key: 'expenses',
      label: 'Despesas',
      value: finance.expenses,
      helper: 'Total que saiu neste mês',
      tone: 'negative',
    },
    {
      key: 'protection',
      label: 'Proteção',
      value: finance.reserve,
      helper: `${finance.monthsCovered} meses de custo essencial · ${Math.round(finance.reservePct)}% da meta`,
      tone: finance.reservePct >= 100 ? 'positive' : 'neutral',
    },
    {
      key: 'netWorth',
      label: 'Patrimônio',
      value: finance.netWorth,
      helper: 'Ativos menos obrigações',
      tone: finance.netWorth >= 0 ? 'positive' : 'negative',
    },
  ]
}

function buildThreeJourneys(finance, state) {
  const hasTransactions = (state.transactions || []).length > 0
  const reserveReady = finance.reservePct >= 100
  const hasInvestments = (state.investments || []).length > 0

  return [
    {
      key: 'organize',
      title: 'Organizar',
      description: hasTransactions
        ? 'Mantenha entradas, saídas e orçamento sob controle para enxergar o mês com clareza.'
        : 'Comece registrando suas movimentações para criar uma visão confiável do mês.',
      cta: hasTransactions ? 'Ver movimentações' : 'Registrar movimentação',
      to: '/movimentacoes/transacoes',
    },
    {
      key: 'protect',
      title: 'Proteger e planejar',
      description: reserveReady
        ? 'Sua reserva atingiu a meta atual. Agora você pode revisar metas e próximos compromissos.'
        : `Sua reserva está em ${Math.round(finance.reservePct)}% da meta. Continue construindo proteção antes de acelerar.`,
      cta: reserveReady ? 'Revisar metas' : 'Fortalecer reserva',
      to: reserveReady ? '/planejamento/metas' : '/reserva',
    },
    {
      key: 'grow',
      title: 'Crescer',
      description: hasInvestments
        ? 'Acompanhe investimentos e patrimônio sem perder de vista seus objetivos e seu perfil.'
        : 'Depois da base organizada, defina seu perfil e comece a estruturar seus investimentos.',
      cta: hasInvestments ? 'Ver investimentos' : 'Conhecer meu perfil',
      to: '/investimentos',
    },
  ]
}

export function buildDashboard(state, month) {
  const finance = aggregateFinance(state, month)
  return {
    finance,
    situation: buildSituation(state, finance),
    pulse: buildPulse(finance),
    indicators: buildFiveIndicators(finance),
    journeys: buildThreeJourneys(finance, state),
  }
}
