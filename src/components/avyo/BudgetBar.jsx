import { Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../lib/format'
import { Card } from '../ui/Card'

export function BudgetBar({ item, onCreate, onEdit, onDelete }) {
  const hasLimit = item.limit !== null
  const rawPct = hasLimit ? Math.round((item.spent / Math.max(1, item.limit)) * 100) : 0
  const pct = Math.min(100, rawPct)
  const over = hasLimit && item.spent > item.limit

  return <Card className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-heading font-semibold">{item.category}</h3>
        {hasLimit
          ? <p className="mt-1 text-xs text-slate-500">{formatCurrency(item.spent)} de {formatCurrency(item.limit)}</p>
          : <p className="mt-1 text-xs font-medium text-amber-200">Sem limite definido</p>}
      </div>
      {hasLimit ? <div className="flex items-center gap-1">
        <strong className={over ? 'mr-1 text-rose-300' : 'mr-1 text-cyan-300'}>{rawPct}%</strong>
        <button type="button" aria-label={`Editar ${item.category}`} onClick={() => onEdit(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200"><Pencil size={15} /></button>
        <button type="button" aria-label={`Excluir ${item.category}`} onClick={() => onDelete(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15} /></button>
      </div> : <button type="button" aria-label={`Criar limite para ${item.category}`} onClick={() => onCreate(item)} className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/15"><PlusCircle size={15} />Criar limite</button>}
    </div>

    {hasLimit ? <>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full rounded-full ${over ? 'bg-rose-400' : pct > 80 ? 'bg-amber-300' : 'bg-gradient-to-r from-blue-500 to-cyan-300'}`} style={{ width: `${pct}%` }} /></div>
      {over && <p className="mt-3 text-xs text-rose-300">Passou {formatCurrency(item.spent - item.limit)} do limite.</p>}
    </> : <p className="mt-4 text-sm text-slate-400">Você gastou <strong className="text-slate-200">{formatCurrency(item.spent)}</strong> nesta categoria no mês.</p>}

    {item.suggested > 0 && <p className="mt-3 text-xs leading-relaxed text-slate-500">Sugestão pela média dos últimos 3 meses: <strong className="text-slate-300">{formatCurrency(item.suggested)}</strong>.</p>}
  </Card>
}
