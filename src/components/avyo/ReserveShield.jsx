import { Pencil } from 'lucide-react'
import { Progress } from '../ui/Progress'
import { formatCurrency } from '../../lib/format'

const deposits = [50, 100, 250, 500, 1000]

export function ReserveShield({ current, target, monthsGoal, monthsCovered, onDeposit, onEdit }) {
  const pct = target > 0 ? current / target * 100 : 0
  const clampedPct = Math.min(100, Math.max(0, pct))

  return <div aria-label="Reserva de emergência" className="text-center">
    <div className="relative mx-auto grid size-36 place-items-center">
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl" />
      <svg role="img" aria-label="Progresso visual da reserva" viewBox="0 0 112 112" className="relative size-28 text-cyan-300">
        <path d="M56 8c9 8 18 12 28 12v31c0 21-12 35-28 43C40 86 28 72 28 51V20c10 0 19-4 28-12Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity=".45" />
        <path d="M56 8c9 8 18 12 28 12v31c0 21-12 35-28 43C40 86 28 72 28 51V20c10 0 19-4 28-12Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" pathLength="100" strokeDasharray={`${clampedPct} 100`} opacity=".9" />
        <text x="56" y="59" textAnchor="middle" dominantBaseline="middle" className="fill-current font-heading text-[22px] font-bold">{monthsCovered}</text>
      </svg>
    </div>
    <p className="mt-3 text-xs font-semibold uppercase tracking-[.16em] text-cyan-300">Meta de {monthsGoal} meses</p>
    <h2 className="mt-1 font-heading text-2xl font-bold">{monthsCovered} meses protegidos</h2>
    <p className="mt-2 text-sm text-slate-400">{formatCurrency(current)} de {formatCurrency(target)} guardados</p>
    <div className="mx-auto mt-5 max-w-md"><Progress value={pct} tone="emerald" label="Progresso da reserva" /></div>

    <div className="mx-auto mt-6 max-w-2xl border-t border-white/[0.06] pt-5">
      <div className="mb-3 flex items-center justify-between gap-4 text-left">
        <div><p className="text-sm font-semibold text-slate-200">Aporte rápido</p><p className="text-xs text-slate-500">Atualiza sua proteção imediatamente.</p></div>
        <button type="button" aria-label="Editar meta da reserva" onClick={onEdit} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 text-xs font-semibold text-slate-200 hover:text-cyan-200"><Pencil size={14} />Editar meta</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {deposits.map((amount) => <button key={amount} type="button" onClick={() => onDeposit(amount)} className="min-h-10 rounded-xl border border-white/[0.07] bg-white/[0.035] text-xs font-semibold text-slate-200 hover:border-cyan-300/20 hover:bg-cyan-300/[0.07]">+ R$ {amount.toLocaleString('pt-BR')}</button>)}
      </div>
    </div>
  </div>
}
