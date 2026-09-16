import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PlannerActions({ actions = [] }) {
  if (!actions.length) return null
  return <div className="mt-4 flex flex-wrap gap-2" aria-label="Ações sugeridas pelo Planejador">{actions.slice(0, 4).map((action, index) => action.to ? <Link key={`${action.label}-${index}`} to={action.to} className="inline-flex items-center gap-1 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/10">{action.label}<ArrowRight size={13} /></Link> : <span key={`${action.label}-${index}`} className="rounded-xl border border-white/[0.06] px-3 py-2 text-xs text-slate-400">{action.label}</span>)}</div>
}
