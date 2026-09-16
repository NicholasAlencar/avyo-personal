import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/format'
import { Card } from '../ui/Card'
import { Progress } from '../ui/Progress'

const deposits = [50, 100, 500]

export function GoalCard({ goal, onDeposit, onEdit, onDelete }) {
  const pct = goal.total > 0 ? goal.saved / goal.total * 100 : 0
  const months = Math.max(1, Math.ceil((new Date(`${goal.deadline}T12:00:00`) - new Date()) / 2629800000))
  const monthly = Math.max(0, goal.total - goal.saved) / months

  return <Card aria-label={`Meta ${goal.name}`} className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-heading text-lg font-semibold">{goal.name}</h3>
        <p className="text-xs text-slate-500">Até {formatDate(goal.deadline)}</p>
      </div>
      <div className="flex items-center gap-1">
        <strong className="mr-1 text-cyan-300">{Math.round(pct)}%</strong>
        <button type="button" aria-label={`Editar ${goal.name}`} onClick={() => onEdit(goal)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200"><Pencil size={15} /></button>
        <button type="button" aria-label={`Excluir ${goal.name}`} onClick={() => onDelete(goal)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15} /></button>
      </div>
    </div>

    <div className="mt-5"><Progress value={pct} tone="violet" label={`Progresso da meta ${goal.name}`} /></div>
    <div className="mt-4 flex justify-between gap-4 text-sm">
      <span className="text-slate-400">{formatCurrency(goal.saved)} guardados de {formatCurrency(goal.total)}</span>
      <span className="shrink-0 text-slate-300">{formatCurrency(monthly)}/mês</span>
    </div>

    <div className="mt-5 border-t border-white/[0.06] pt-4">
      <p className="mb-2 text-xs font-medium text-slate-500">Aporte rápido</p>
      <div className="grid grid-cols-3 gap-2">
        {deposits.map((amount) => <button key={amount} type="button" onClick={() => onDeposit(goal, amount)} className="min-h-10 rounded-xl border border-white/[0.07] bg-white/[0.035] text-xs font-semibold text-slate-200 hover:border-cyan-300/20 hover:bg-cyan-300/[0.07]">+ R$ {amount.toLocaleString('pt-BR')}</button>)}
      </div>
    </div>
  </Card>
}
