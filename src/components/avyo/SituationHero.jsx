import { ArrowRight, CalendarDays, ShieldCheck, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../lib/format'
import { Card } from '../ui/Card'

export function SituationHero({ situation }) {
  const metrics = situation.hasPlan
    ? [
        { label: 'Disponível agora', value: situation.total, icon: WalletCards },
        { label: 'Comprometido + proteção', value: situation.committed, icon: ShieldCheck },
        { label: 'Livre até receber', value: situation.free, icon: CalendarDays },
      ]
    : [
        { label: 'Resultado do mês', value: situation.total, icon: WalletCards },
        { label: 'Comprometido no plano', value: 0, icon: ShieldCheck },
        { label: 'Livre para planejar', value: situation.free, icon: CalendarDays },
      ]

  return <Card aria-label="Sua situação financeira" className="group relative overflow-hidden p-6 sm:p-8">
    <div className="absolute -right-16 -top-20 size-64 rounded-full bg-blue-500/20 blur-3xl" />
    <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-violet-500/15 blur-3xl" />
    <div className="relative">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-semibold text-cyan-200"><CalendarDays size={14} />Sua situação financeira</div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">{situation.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{situation.detail}</p>
        </div>
        {situation.hasPlan && situation.days > 0 && <div className="shrink-0 rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3 text-right"><p className="text-xs uppercase tracking-[.14em] text-slate-500">Ritmo sugerido</p><strong className="mt-1 block font-heading text-xl text-cyan-200">{formatCurrency(situation.dailyRhythm)}/dia</strong></div>}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><span className="flex items-center gap-2 text-xs font-medium text-slate-400"><Icon size={15} className="text-cyan-300" />{label}</span><strong className={`mt-2 block font-heading text-xl ${value < 0 ? 'text-rose-300' : 'text-white'}`}>{formatCurrency(value)}</strong></div>)}
      </div>

      {situation.hasPlan
        ? <Link to="/ate-pagamento" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Ver plano até receber <ArrowRight size={16} className="transition group-hover:translate-x-0.5" /></Link>
        : <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-violet-300/10 bg-violet-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-heading font-semibold text-white">Monte seu plano até receber</p><p className="mt-1 text-sm text-slate-400">Separe compromissos, reserva de segurança e veja um ritmo diário possível.</p></div><Link to="/ate-pagamento" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-violet-200">Criar plano <ArrowRight size={16} /></Link></div>}
    </div>
  </Card>
}
