import { CreditCard } from 'lucide-react'
import { Progress } from '../ui/Progress'
import { formatCurrency } from '../../lib/format'

export function CardVisual({ card }) {
  const usage = card.limit > 0 ? card.currentBill / card.limit * 100 : 0
  return <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-700/50 via-[#17213b] to-violet-700/30 p-5 shadow-xl"><div className="absolute -right-10 -top-12 size-36 rounded-full bg-cyan-300/10 blur-2xl" /><div className="relative"><div className="flex items-center justify-between"><CreditCard className="text-cyan-200" /><span className="text-xs uppercase tracking-wider text-slate-400">{card.brand}</span></div><h3 className="mt-7 font-heading text-lg font-semibold">{card.name}</h3><p className="mt-1 font-mono tracking-[.2em] text-slate-400">•••• {card.last4}</p><div className="mt-5 flex justify-between text-sm"><span className="text-slate-400">Fatura <strong className="ml-1 text-white">{formatCurrency(card.currentBill)}</strong></span><span className={usage > 80 ? 'text-rose-300' : 'text-cyan-300'}>{Math.round(usage)}%</span></div><div className="mt-2"><Progress value={usage} tone={usage > 80 ? 'rose' : 'cyan'} label={`Uso do cartão ${card.name}`} /></div></div></article>
}
