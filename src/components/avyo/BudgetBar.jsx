import { formatCurrency } from '../../lib/format'
import { Progress } from '../ui/Progress'

export function BudgetBar({ budget, spent }) { const pct = budget.limit > 0 ? spent / budget.limit * 100 : 0; return <div><div className="mb-2 flex items-center justify-between gap-4"><div><h3 className="font-medium">{budget.category}</h3><p className="text-xs text-slate-500">{formatCurrency(spent)} de {formatCurrency(budget.limit)}</p></div><span className={pct > 100 ? 'text-rose-300' : 'text-cyan-300'}>{Math.round(pct)}%</span></div><Progress value={pct} tone={pct > 100 ? 'rose' : pct > 80 ? 'amber' : 'cyan'} label={`Orçamento de ${budget.category}`} /></div> }
