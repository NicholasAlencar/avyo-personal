import { CheckCircle2, Circle, ShieldCheck, WalletCards } from 'lucide-react'
import { formatCurrency } from '../../lib/format'
import { Card } from '../ui/Card'

export function PaydayBreakdown({ plan, result, onTogglePaid }) {
  const items = [...(plan.plannedItems || []), ...(plan.extraItems || [])]
  const paid = new Set(plan.paidItemIds || [])

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Plano ativo</p>
          <h2 className="mt-2 font-heading text-lg font-semibold">O que já tem destino</h2>
        </div>
        <div className="rounded-xl bg-white/[0.04] px-4 py-3 text-right">
          <p className="text-xs text-slate-500">Comprometido agora</p>
          <strong className="mt-1 block">{formatCurrency(result.committed)}</strong>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {items.length ? items.map((item) => {
          const isPaid = paid.has(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTogglePaid(item.id)}
              className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
              aria-pressed={isPaid}
            >
              <span className="flex items-center gap-3 text-sm">
                {isPaid ? <CheckCircle2 size={18} className="text-emerald-300" /> : <Circle size={18} className="text-slate-500" />}
                <span className={isPaid ? 'text-slate-500 line-through' : 'text-slate-200'}>{item.description}</span>
              </span>
              <strong className={isPaid ? 'text-slate-500 line-through' : ''}>{formatCurrency(item.amount)}</strong>
            </button>
          )
        }) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">Nenhum compromisso incluído neste plano.</p>}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white/[0.03] p-4"><p className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={14} />Proteção</p><strong className="mt-2 block">{formatCurrency(plan.safetyReserve)}</strong></div>
        <div className="rounded-xl bg-white/[0.03] p-4"><p className="flex items-center gap-2 text-xs text-slate-500"><WalletCards size={14} />Gasto hoje</p><strong className="mt-2 block">{formatCurrency(plan.todaySpent)}</strong></div>
        <div className="rounded-xl bg-white/[0.03] p-4"><p className="text-xs text-slate-500">Entradas extras</p><strong className="mt-2 block">{formatCurrency(plan.extraIncome)}</strong></div>
      </div>
    </Card>
  )
}
