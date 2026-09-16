import { useMemo } from 'react'
import { useFinanceStore } from '../context/FinanceContext'
import { buildDashboard } from '../lib/dashboard'
import { buildInsights } from '../lib/insights'
import { monthKey } from '../lib/format'
import { PageHeader } from '../components/avyo/PageHeader'
import { SituationHero } from '../components/avyo/SituationHero'
import { InsightsFeed } from '../components/avyo/InsightsFeed'
import { PulseCard } from '../components/avyo/PulseCard'
import { MonthSummary } from '../components/avyo/MonthSummary'
import { NextActions } from '../components/avyo/NextActions'

export function HomePage() {
  const { state } = useFinanceStore()
  const dashboard = useMemo(() => buildDashboard(state, monthKey()), [state])
  const stateWithDashboardPlan = useMemo(() => ({
    ...state,
    atePagamento: dashboard.situation.hasPlan
      ? {
          ...state.atePagamento,
          remainingFree: dashboard.situation.free,
          dailyRhythm: dashboard.situation.dailyRhythm,
        }
      : null,
  }), [state, dashboard.situation])
  const insights = useMemo(() => buildInsights(dashboard.finance, stateWithDashboardPlan), [dashboard.finance, stateWithDashboardPlan])

  return <div className="space-y-8">
    <PageHeader eyebrow="Seu dinheiro, sem complicação" title={`Olá, ${state.profile.name.split(' ')[0] || 'você'}`} subtitle="Entenda sua situação em poucos segundos e avance por um próximo passo de cada vez." />
    <SituationHero situation={dashboard.situation} />
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <PulseCard pulse={dashboard.pulse} />
      <div className="avyo-card p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Leitura rápida</p><h2 className="mt-1 font-heading text-lg font-semibold">O que mudou no seu dinheiro</h2></div><span className="rounded-full bg-cyan-300/[0.07] px-3 py-1 text-xs font-medium text-cyan-200">Atualizado agora</span></div><p className="mt-4 text-sm leading-relaxed text-slate-400">O AVYO cruza fluxo do mês, reserva, cartões e compromissos para destacar o que merece atenção sem esconder seus números.</p></div>
    </div>
    <MonthSummary indicators={dashboard.indicators} />
    <InsightsFeed insights={insights} />
    <NextActions journeys={dashboard.journeys} />
  </div>
}
