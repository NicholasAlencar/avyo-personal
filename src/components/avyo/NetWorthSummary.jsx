import { formatCurrency } from '../../lib/format'
import { Card } from '../ui/Card'

export function NetWorthSummary({ assets, liabilities }) {
  const net = Number(assets || 0) - Number(liabilities || 0)
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-slate-500">Ativos</p><strong className="mt-2 block font-heading text-2xl text-emerald-300">{formatCurrency(assets)}</strong></Card>
        <Card className="p-5"><p className="text-sm text-slate-500">Passivos</p><strong className="mt-2 block font-heading text-2xl text-rose-300">{formatCurrency(liabilities)}</strong></Card>
        <Card className="border-cyan-300/15 p-5"><p className="text-sm text-slate-500">Patrimônio líquido</p><strong className="mt-2 block font-heading text-2xl text-cyan-200">{formatCurrency(net)}</strong></Card>
      </div>
      <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Ativos − passivos = patrimônio líquido</p>
    </div>
  )
}
