import { useMemo } from 'react'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { buildInsights, situationPhrase } from '../lib/insights'
import { monthKey } from '../lib/format'
import { PageHeader } from '../components/avyo/PageHeader'
import { SituationHero } from '../components/avyo/SituationHero'
import { InsightsFeed } from '../components/avyo/InsightsFeed'
import { PulseCard } from '../components/avyo/PulseCard'
import { MonthSummary } from '../components/avyo/MonthSummary'
import { NextActions } from '../components/avyo/NextActions'

function enrichPaydayPlan(plan) {
  if (!plan) return null
  const planned = (plan.plannedItems || []).reduce((total, item) => total + Number(item.amount || 0), 0)
  const remainingFree = Number(plan.balance || 0) - planned - Number(plan.safetyReserve || 0)
  const days = Math.max(1, Math.ceil((new Date(`${plan.nextPaymentDate}T12:00:00`) - new Date()) / 86400000))
  return { ...plan, remainingFree, dailyRhythm: remainingFree / days }
}

export function HomePage() {
  const { state } = useFinanceStore()
  const finance = useMemo(() => aggregateFinance(state, monthKey()), [state])
  const plan = useMemo(() => enrichPaydayPlan(state.atePagamento), [state.atePagamento])
  const stateWithPlan = useMemo(() => ({ ...state, atePagamento: plan }), [state, plan])
  const insights = useMemo(() => buildInsights(finance, stateWithPlan), [finance, stateWithPlan])
  const situation = situationPhrase(finance, plan)
  return <div className="space-y-8"><PageHeader eyebrow="Seu dinheiro, sem complicação" title={`Olá, ${state.profile.name.split(' ')[0] || 'você'}`} subtitle="Veja o que seus números significam e escolha um próximo passo possível." /><SituationHero situation={situation} hasPlan={Boolean(plan)} /><div className="grid gap-4 lg:grid-cols-2"><PulseCard score={finance.healthScore} /><MonthSummary finance={finance} /></div><InsightsFeed insights={insights} /><NextActions insights={insights} /></div>
}
