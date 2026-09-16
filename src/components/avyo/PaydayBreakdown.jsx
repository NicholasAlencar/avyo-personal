import { CheckCircle2, Circle } from 'lucide-react'
import { Card } from '../ui/Card'
import { formatCurrency } from '../../lib/format'

export function PaydayBreakdown({ plan, result, onTogglePaid, onTodaySpent }) {
  const items = [...(plan.plannedItems || []), ...(plan.extraItems || [])]
  const paid = new Set(plan.paidItemIds || [])

  return <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
    <Card className="p-6" aria-label="Compromissos do plano" role="region">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-cyan-300">Compromissos</p><h2 className="mt-1 font-heading text-xl font-bold">Até o próximo recebimento</h2></div><strong className="font-heading text-lg">{formatCurrency(result.committed)}</strong></div>
      <div className="mt-5 space-y-2">{items.length ? items.map((item) => {
        const isPaid = paid.has(item.id)
        const isIncome = item.type === 'income'
        return <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3"><div><p className={isPaid ? 'text-sm text-slate-500 line-through' : 'text-sm text-slate-200'}>{item.description}</p><p className="text-xs text-slate-500">{isIncome ? 'Entrada adicional' : item.source === 'manual' ? 'Adicionado manualmente' : 'Compromisso do plano'}</p></div><div className="flex items-center gap-2"><strong className={isIncome ? 'text-emerald-300' : 'text-slate-300'}>{isIncome ? '+' : ''}{formatCurrency(item.amount)}</strong>{!isIncome && <button type="button" aria-label={isPaid ? `Reabrir ${item.description}` : `Marcar ${item.description} como pago`} onClick={() => onTogglePaid(item.id)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200">{isPaid ? <CheckCircle2 size={18} /> : <Circle size={18} />}</button>}</div></div>
      }) : <p className="text-sm text-slate-500">Nenhum compromisso registrado.</p>}</div>
    </Card>

    <Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">Hoje</p><h2 className="mt-1 font-heading text-xl font-bold">Acompanhe sem perder o plano</h2><label className="mt-5 block text-sm text-slate-300">Gasto hoje<input aria-label="Gasto hoje" type="number" min="0" step="any" value={plan.todaySpent || ''} onChange={(event) => onTodaySpent(Number(event.target.value || 0))} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50" /></label><p className="mt-3 text-sm text-slate-400">{formatCurrency(plan.todaySpent || 0)} gastos hoje</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[0.035] p-3"><p className="text-xs text-slate-500">Ritmo diário</p><strong className="mt-1 block">{formatCurrency(result.dailyRhythm)}</strong></div><div className="rounded-xl bg-white/[0.035] p-3"><p className="text-xs text-slate-500">Ritmo semanal</p><strong className="mt-1 block">{formatCurrency(result.weeklyRhythm)}</strong></div></div></Card>
  </div>
}
