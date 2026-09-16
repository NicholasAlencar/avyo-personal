import { CalendarClock } from 'lucide-react'
import { formatCurrency } from '../../lib/format'

const monthLabel = (offset) => {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + offset)
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(date)
}

export function InstallmentTimeline({ installment }) {
  const remaining = Math.max(0, Number(installment.remainingMonths ?? (Number(installment.installmentsCount) - Number(installment.currentInstallment))) || 0)
  const visible = Math.min(remaining, 6)

  return <section className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4" aria-label={`Próximos meses de ${installment.description}`}>
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><CalendarClock size={16} className="text-cyan-300" />Próximos meses</div><span className="text-xs text-slate-500">{remaining} restante(s)</span></div>
    {remaining === 0 ? <p className="mt-3 text-sm text-emerald-300">Parcelamento concluído.</p> : <div className="mt-3 grid gap-2 sm:grid-cols-3">{Array.from({ length: visible }, (_, index) => <div key={index} className="rounded-xl bg-white/[0.035] px-3 py-2"><p className="text-[11px] uppercase tracking-wide text-slate-500">{monthLabel(index + 1)}</p><p className="mt-1 text-sm font-semibold text-slate-200">{formatCurrency(installment.monthlyValue)}</p></div>)}</div>}
    {remaining > visible && <p className="mt-3 text-xs text-slate-500">+ {remaining - visible} mês(es) depois disso</p>}
  </section>
}
