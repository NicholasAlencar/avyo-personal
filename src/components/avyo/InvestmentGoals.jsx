import { useState } from 'react'
import { useFinanceStore } from '../../context/FinanceContext'
import { formatCurrency } from '../../lib/format'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function InvestmentGoals() {
  const { state, updateProfile } = useFinanceStore()
  const [monthly, setMonthly] = useState(String(state.profile.monthlyInvestmentGoal || ''))
  const [total, setTotal] = useState(String(state.profile.investmentTotalGoal || ''))
  const save = () => updateProfile({ monthlyInvestmentGoal: Number(monthly || 0), investmentTotalGoal: Number(total || 0) })
  const invested = state.investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0)
  const missing = Math.max(0, Number(state.profile.investmentTotalGoal || 0) - invested)
  const months = Number(state.profile.monthlyInvestmentGoal || 0) > 0 ? Math.ceil(missing / Number(state.profile.monthlyInvestmentGoal)) : null

  return <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]"><Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-cyan-300">Objetivos</p><h2 className="mt-2 font-heading text-xl font-bold">Defina o ritmo</h2><div className="mt-5 space-y-4"><label className="block text-sm text-slate-300">Meta de aporte mensal<input aria-label="Meta de aporte mensal" type="number" min="0" step="any" value={monthly} onChange={(event) => setMonthly(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50" /></label><label className="block text-sm text-slate-300">Meta de patrimônio investido<input aria-label="Meta de patrimônio investido" type="number" min="0" step="any" value={total} onChange={(event) => setTotal(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50" /></label></div><Button className="mt-5 w-full" onClick={save}>Salvar objetivos</Button></Card><Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">Seu plano atual</p><h2 className="mt-2 font-heading text-2xl font-bold">{formatCurrency(state.profile.monthlyInvestmentGoal || 0)} por mês</h2><p className="mt-2 text-sm text-slate-400">Meta total de {formatCurrency(state.profile.investmentTotalGoal || 0)}. Hoje sua carteira soma {formatCurrency(invested)}.</p>{months ? <p className="mt-5 rounded-xl bg-white/[0.035] p-4 text-sm text-slate-300">Mantido apenas como referência aritmética, o aporte atual cobriria a diferença nominal em cerca de <strong>{months} meses</strong>, sem assumir rentabilidade.</p> : <p className="mt-5 text-sm text-slate-500">Defina um aporte mensal para visualizar o ritmo nominal.</p>}<p className="mt-5 text-xs text-slate-500">Projeção simples, sem promessa de retorno e sem considerar impostos, taxas ou oscilação.</p></Card></div>
}
