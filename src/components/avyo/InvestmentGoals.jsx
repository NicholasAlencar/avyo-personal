import { useState } from 'react'
import { useFinanceStore } from '../../context/FinanceContext'
import { formatCurrency } from '../../lib/format'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#0c1426] px-3 text-white outline-none focus:border-cyan-400/50'

export function InvestmentGoals() {
  const { state, updateProfile } = useFinanceStore()
  const [monthly, setMonthly] = useState(state.profile.monthlyInvestmentGoal || 0)
  const [total, setTotal] = useState(state.profile.investmentTotalGoal || 0)
  const [saved, setSaved] = useState(false)

  const invested = state.investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0)
  const progress = total > 0 ? Math.min(100, Math.round((invested / total) * 100)) : 0

  const save = () => {
    updateProfile({ monthlyInvestmentGoal: Number(monthly || 0), investmentTotalGoal: Number(total || 0) })
    setSaved(true)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_.9fr]">
      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Objetivos</p>
        <h2 className="mt-2 font-heading text-xl font-semibold">Defina um ritmo de construção</h2>
        <p className="mt-2 text-sm text-slate-400">Metas servem como referência. Você pode ajustar sem transformar o mês em uma obrigação rígida.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300">Meta mensal de aportes
            <input aria-label="Meta mensal de aportes" type="number" min="0" step="any" className={inputClass} value={monthly} onChange={(event) => { setMonthly(event.target.value); setSaved(false) }} />
          </label>
          <label className="text-sm text-slate-300">Meta total de investimentos
            <input aria-label="Meta total de investimentos" type="number" min="0" step="any" className={inputClass} value={total} onChange={(event) => { setTotal(event.target.value); setSaved(false) }} />
          </label>
        </div>

        <Button type="button" className="mt-5" onClick={save}>Salvar objetivos</Button>
        {saved && <p role="status" className="mt-4 text-sm text-emerald-300">Objetivos atualizados neste dispositivo.</p>}
      </Card>

      <Card className="p-6">
        <p className="text-sm text-slate-400">Seu ritmo definido</p>
        <h3 className="mt-2 font-heading text-2xl font-bold">{formatCurrency(Number(monthly || 0))} por mês</h3>
        <p className="mt-1 text-sm text-slate-500">Meta de patrimônio investido: {formatCurrency(Number(total || 0))}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{formatCurrency(invested)} acumulados</span><span>{progress}%</span></div>
        <p className="mt-5 text-xs leading-relaxed text-slate-500">A meta é educativa e não pressupõe rentabilidade futura. Ajuste o aporte ao seu orçamento e à sua reserva de emergência.</p>
      </Card>
    </div>
  )
}
