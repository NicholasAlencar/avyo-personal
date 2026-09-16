import { ArrowRight, CircleDollarSign, ShieldCheck, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

const icons = {
  organize: CircleDollarSign,
  protect: ShieldCheck,
  grow: TrendingUp,
}

export function NextActions({ journeys }) {
  return <section aria-label="Jornadas financeiras" className="space-y-3">
    <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-300">Seu caminho</p><h2 className="mt-1 font-heading text-xl font-semibold">Três jornadas, sem tentar resolver tudo de uma vez</h2></div>
    <div className="grid gap-4 lg:grid-cols-3">
      {journeys.map((journey, index) => {
        const Icon = icons[journey.key] || CircleDollarSign
        return <Card key={journey.key} className="group flex min-h-56 flex-col p-5">
          <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-200"><Icon size={19} /></span><span className="text-xs font-semibold text-slate-600">0{index + 1}</span></div>
          <h3 className="mt-5 font-heading text-lg font-semibold">{journey.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{journey.description}</p>
          <Link to={journey.to} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">{journey.cta} <ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></Link>
        </Card>
      })}
    </div>
  </section>
}
