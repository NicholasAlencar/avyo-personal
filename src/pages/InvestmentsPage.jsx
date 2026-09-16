import { useMemo, useState } from 'react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency, formatDate } from '../lib/format'
import { PageHeader } from '../components/avyo/PageHeader'
import { InvestmentOverview } from '../components/avyo/InvestmentOverview'
import { InvestmentPortfolio } from '../components/avyo/InvestmentPortfolio'
import { SuitabilityQuiz } from '../components/avyo/SuitabilityQuiz'
import { AllocationEditor } from '../components/avyo/AllocationEditor'
import { NextContribution } from '../components/avyo/NextContribution'
import { InvestmentGoals } from '../components/avyo/InvestmentGoals'
import { Card } from '../components/ui/Card'

const tabs = ['Visão geral', 'Minha carteira', 'Encontre meu perfil', 'Distribuição', 'Próximo aporte', 'Objetivos', 'Evolução']

function Evolution({ investments }) {
  const items = useMemo(() => [...investments].sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''))), [investments])
  const invested = items.reduce((sum, item) => sum + Number(item.investedValue || 0), 0)
  const current = items.reduce((sum, item) => sum + Number(item.currentValue || 0), 0)
  return <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-cyan-300">Evolução</p><h2 className="mt-2 font-heading text-3xl font-bold">{formatCurrency(current)}</h2><p className="mt-2 text-sm text-slate-400">Contra {formatCurrency(invested)} aportados no total.</p><p className={`mt-4 text-sm ${current >= invested ? 'text-emerald-300' : 'text-rose-300'}`}>{formatCurrency(current - invested)} de diferença nominal.</p></Card><Card className="p-6"><h2 className="font-heading text-xl font-bold">Linha da carteira</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"><div><strong className="text-sm text-slate-200">{item.name}</strong><p className="mt-1 text-xs text-slate-500">{item.date ? formatDate(item.date) : 'Sem data cadastrada'} · {item.category}</p></div><span className="text-sm text-slate-300">{formatCurrency(item.currentValue)}</span></div>)}</div></Card></div>
}

export function InvestmentsPage() {
  const { state } = useFinanceStore()
  const [tab, setTab] = useState('Visão geral')

  return <><PageHeader eyebrow="Construção de patrimônio" title="Investimentos" subtitle="Entenda sua carteira sem transformar escolhas em apostas." /><div role="tablist" aria-label="Visões de investimentos" className="mb-6 flex gap-2 overflow-x-auto">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`shrink-0 rounded-xl px-4 py-2 text-sm ${tab === item ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-500 hover:bg-white/[0.04]'}`}>{item}</button>)}</div><div role="tabpanel" aria-label={tab}>{tab === 'Visão geral' && <InvestmentOverview investments={state.investments} />}{tab === 'Minha carteira' && <InvestmentPortfolio />}{tab === 'Encontre meu perfil' && <SuitabilityQuiz />}{tab === 'Distribuição' && <AllocationEditor />}{tab === 'Próximo aporte' && <NextContribution profile={state.investmentProfile.profile} />}{tab === 'Objetivos' && <InvestmentGoals />}{tab === 'Evolução' && <Evolution investments={state.investments} />}</div><p className="mt-6 text-xs text-slate-500">Conteúdo educativo. As telas ajudam a organizar informações e cenários, mas não constituem recomendação individual de investimento nem promessa de rentabilidade.</p></>
}
