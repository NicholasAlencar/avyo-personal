import { ArrowDownRight, ArrowUpRight, Landmark, ShieldCheck, WalletCards } from 'lucide-react'
import { formatCurrency } from '../../lib/format'
import { Card } from '../ui/Card'

const icons = {
  result: WalletCards,
  income: ArrowUpRight,
  expenses: ArrowDownRight,
  protection: ShieldCheck,
  netWorth: Landmark,
}

const tones = {
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
  neutral: 'text-cyan-300',
}

export function MonthSummary({ indicators }) {
  return <section aria-label="Indicadores financeiros" className="space-y-3">
    <div className="flex items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Visão do mês</p><h2 className="mt-1 font-heading text-xl font-semibold">Os cinco números que importam agora</h2></div>
      <p className="hidden max-w-md text-right text-xs leading-relaxed text-slate-500 md:block">Uma leitura curta para você entender resultado, fluxo, proteção e patrimônio sem abrir várias telas.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {indicators.map((indicator) => {
        const Icon = icons[indicator.key] || WalletCards
        const tone = tones[indicator.tone] || tones.neutral
        return <Card key={indicator.key} className="min-h-40 p-4">
          <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-slate-400">{indicator.label}</span><span className={`grid size-8 place-items-center rounded-lg bg-white/[0.04] ${tone}`}><Icon size={16} /></span></div>
          <strong className={`mt-5 block font-heading text-xl ${tone}`}>{formatCurrency(indicator.value)}</strong>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{indicator.helper}</p>
        </Card>
      })}
    </div>
  </section>
}
