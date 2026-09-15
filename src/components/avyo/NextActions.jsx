import { ArrowRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

export function NextActions({ insights }) {
  const actions = insights.slice(0, 3)
  return <Card className="p-5"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Target size={18} /></div><h2 className="font-heading text-lg font-semibold">Próximos passos</h2></div><div className="mt-4 space-y-2">{actions.map((item, index) => <Link key={item.id} to={item.to || '/planejador'} className="group flex items-center gap-3 rounded-xl p-3 hover:bg-white/[0.04]"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-xs text-slate-400">{index + 1}</span><span className="flex-1 text-sm text-slate-300">{item.title}</span><ArrowRight size={15} className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" /></Link>)}</div></Card>
}
