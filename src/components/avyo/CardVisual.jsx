import { CreditCard, Eye, Pencil, Trash2 } from 'lucide-react'
import { Progress } from '../ui/Progress'
import { formatCurrency } from '../../lib/format'

const themes = [
  'from-violet-700/55 via-[#171b36] to-fuchsia-700/25',
  'from-emerald-700/45 via-[#10241f] to-cyan-700/25',
  'from-orange-700/45 via-[#241810] to-amber-700/25',
  'from-blue-700/50 via-[#17213b] to-violet-700/30',
]

function themeFor(value = '') {
  const score = [...String(value).toLowerCase()].reduce((total, char) => total + char.charCodeAt(0), 0)
  return themes[score % themes.length]
}

export function CardVisual({ card, onDetails, onEdit, onDelete }) {
  const limit = Number(card.limit) || 0
  const bill = Number(card.currentBill) || 0
  const usage = limit > 0 ? bill / limit * 100 : 0
  return <article className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${themeFor(card.institution)} p-5 shadow-xl`}>
    <div className="absolute -right-10 -top-12 size-36 rounded-full bg-cyan-300/10 blur-2xl" />
    <div className="relative"><div className="flex items-center justify-between"><CreditCard className="text-cyan-200" /><span className="text-xs uppercase tracking-wider text-slate-400">{card.brand}</span></div><h3 className="mt-7 font-heading text-lg font-semibold">{card.name}</h3><p className="mt-1 font-mono tracking-[.2em] text-slate-400">•••• {card.last4}</p><p className="mt-2 text-xs text-slate-500">{card.institution}</p><div className="mt-5 flex justify-between text-sm"><span className="text-slate-400">Fatura <strong className="ml-1 text-white">{formatCurrency(bill)}</strong></span><span className={usage > 80 ? 'text-rose-300' : 'text-cyan-300'}>{Math.round(usage)}%</span></div><div className="mt-2"><Progress value={Math.min(100, usage)} tone={usage > 80 ? 'rose' : 'cyan'} label={`Uso do cartão ${card.name}`} /></div>
      {(onDetails || onEdit || onDelete) && <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">{onDetails && <button type="button" aria-label={`Detalhes ${card.name}`} onClick={() => onDetails(card)} className="flex min-h-9 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.1]"><Eye size={14} />Detalhes</button>}{onEdit && <button type="button" aria-label={`Editar ${card.name}`} onClick={() => onEdit(card)} className="flex min-h-9 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.1]"><Pencil size={14} />Editar</button>}{onDelete && <button type="button" aria-label={`Excluir ${card.name}`} onClick={() => onDelete(card)} className="flex min-h-9 items-center gap-2 rounded-xl bg-rose-400/[0.08] px-3 text-xs font-semibold text-rose-200 hover:bg-rose-400/[0.14]"><Trash2 size={14} />Excluir</button>}</div>}
    </div>
  </article>
}
