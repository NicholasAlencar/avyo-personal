import { useState } from 'react'
import { useFinanceStore } from '../context/FinanceContext'
import { PageHeader } from '../components/avyo/PageHeader'
import { InvestmentOverview } from '../components/avyo/InvestmentOverview'
import { InvestmentPortfolio } from '../components/avyo/InvestmentPortfolio'
import { SuitabilityQuiz } from '../components/avyo/SuitabilityQuiz'
import { AllocationPanel } from '../components/avyo/AllocationPanel'
import { NextContribution } from '../components/avyo/NextContribution'
const tabs = ['Resumo', 'Carteira', 'Perfil', 'Distribuição', 'Próximo aporte']
export function InvestmentsPage() { const { state } = useFinanceStore(); const [tab, setTab] = useState('Resumo'); return <><PageHeader eyebrow="Construção de patrimônio" title="Investimentos" subtitle="Entenda sua carteira sem transformar escolhas em apostas." /><div role="tablist" aria-label="Visões de investimentos" className="mb-6 flex gap-2 overflow-x-auto">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`shrink-0 rounded-xl px-4 py-2 text-sm ${tab === item ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-500 hover:bg-white/[0.04]'}`}>{item}</button>)}</div>{tab === 'Resumo' && <InvestmentOverview investments={state.investments} />}{tab === 'Carteira' && <InvestmentPortfolio investments={state.investments} />}{tab === 'Perfil' && <SuitabilityQuiz />}{tab === 'Distribuição' && <AllocationPanel profile={state.investmentProfile.profile} />}{tab === 'Próximo aporte' && <NextContribution profile={state.investmentProfile.profile} />}</> }
