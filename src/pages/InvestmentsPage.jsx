import { useMemo, useState } from 'react'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { PageHeader } from '../components/avyo/PageHeader'
import { InvestmentOverview } from '../components/avyo/InvestmentOverview'
import { InvestmentPortfolio } from '../components/avyo/InvestmentPortfolio'
import { SuitabilityQuiz } from '../components/avyo/SuitabilityQuiz'
import { AllocationEditor } from '../components/avyo/AllocationEditor'
import { NextContribution } from '../components/avyo/NextContribution'
import { InvestmentGoals } from '../components/avyo/InvestmentGoals'
import { Card } from '../components/ui/Card'

const tabs = ['Visão geral', 'Minha carteira', 'Encontre meu perfil', 'Distribuição', 'Próximo aporte', 'Objetivos', 'Evolução']

function InvestmentEvolution({ investments }) {
  const summary = useMemo(() => {
    const invested = investments.reduce((sum, item) => sum + Number(item.investedValue || 0), 0)
    const current = investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0)
    const difference = current - invested
    const percentage = invested > 0 ? (difference / invested) * 100 : 0
    return { invested, current, difference, percentage }
  }, [investments])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-slate-400">Total aportado</p><strong className="mt-2 block font-heading text-2xl">{formatCurrency(summary.invested)}</strong></Card>
        <Card className="p-5"><p className="text-sm text-slate-400">Valor atual</p><strong className="mt-2 block font-heading text-2xl">{formatCurrency(summary.current)}</strong></Card>
        <Card className="p-5"><p className="text-sm text-slate-400">Variação registrada</p><strong className={`mt-2 flex items-center gap-2 font-heading text-2xl ${summary.difference >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{summary.difference >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}{formatCurrency(summary.difference)}</strong><p className="mt-1 text-xs text-slate-500">{summary.percentage.toFixed(2)}% sobre o valor aportado</p></Card>
      </div>

      <Card className="p-6">
        <h2 className="font-heading text-xl font-semibold">Evolução por posição</h2>
        <p className="mt-1 text-sm text-slate-400">Comparação simples entre valor aportado e valor atual informado por você.</p>
        <div className="mt-5 space-y-3">
          {investments.length ? investments.map((item) => {
            const invested = Number(item.investedValue || 0)
            const current = Number(item.currentValue || 0)
            const diff = current - invested
            return (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white/[0.035] p-4">
                <div><strong className="text-sm">{item.name}</strong><p className="mt-1 text-xs text-slate-500">{formatCurrency(invested)} aportados</p></div>
                <div className="text-right"><strong className={diff >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{diff >= 0 ? '+' : ''}{formatCurrency(diff)}</strong><p className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500"><ArrowUpRight size={12} />{formatCurrency(current)} atuais</p></div>
              </div>
            )
          }) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">Adicione investimentos à carteira para acompanhar a evolução.</p>}
        </div>
        <p className="mt-5 text-xs text-slate-500">Variações passadas não indicam resultados futuros. Os valores refletem apenas os dados cadastrados no AVYO.</p>
      </Card>
    </div>
  )
}

export function InvestmentsPage() {
  const { state } = useFinanceStore()
  const [tab, setTab] = useState('Visão geral')
  const allocation = state.investmentProfile?.answers?.allocation

  return (
    <>
      <PageHeader eyebrow="Construção de patrimônio" title="Investimentos" subtitle="Entenda sua carteira, seu perfil e seus objetivos sem transformar escolhas em apostas." />
      <div role="tablist" aria-label="Visões de investimentos" className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => (
          <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`shrink-0 rounded-xl px-4 py-2 text-sm transition ${tab === item ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'}`}>{item}</button>
        ))}
      </div>

      {tab === 'Visão geral' && <InvestmentOverview investments={state.investments} />}
      {tab === 'Minha carteira' && <InvestmentPortfolio investments={state.investments} />}
      {tab === 'Encontre meu perfil' && <SuitabilityQuiz />}
      {tab === 'Distribuição' && <AllocationEditor />}
      {tab === 'Próximo aporte' && <NextContribution profile={state.investmentProfile.profile} allocation={allocation} />}
      {tab === 'Objetivos' && <InvestmentGoals />}
      {tab === 'Evolução' && <InvestmentEvolution investments={state.investments} />}
    </>
  )
}
