import { ArrowRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

export function SituationHero({ situation, hasPlan }) {
  return <Card className="group relative overflow-hidden p-6 sm:p-8"><div className="absolute -right-16 -top-20 size-64 rounded-full bg-blue-500/20 blur-3xl" /><div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-violet-500/15 blur-3xl" /><div className="relative"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-semibold text-cyan-200"><CalendarDays size={14} />Sua situação agora</div><h2 className="max-w-3xl font-heading text-3xl font-bold tracking-tight sm:text-4xl">{situation.title}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">{situation.detail}</p>{hasPlan && <Link to="/ate-pagamento" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Ver plano até receber <ArrowRight size={16} className="transition group-hover:translate-x-0.5" /></Link>}</div></Card>
}
