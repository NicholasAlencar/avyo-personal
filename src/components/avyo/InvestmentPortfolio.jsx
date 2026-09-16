import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../../context/FinanceContext'
import { formatCurrency } from '../../lib/format'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ConfirmDialog } from './ConfirmDialog'
import { EmptyState } from './EmptyState'
import { RecordDialog } from './RecordDialog'

const fields = [
  { name: 'name', label: 'Nome', required: true },
  { name: 'institution', label: 'Instituição', required: true },
  { name: 'category', label: 'Categoria', required: true },
  { name: 'investedValue', label: 'Valor aportado', type: 'number', required: true },
  { name: 'currentValue', label: 'Valor atual', type: 'number', required: true },
  { name: 'date', label: 'Data do primeiro aporte', type: 'date' },
]

export function InvestmentPortfolio() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const save = (record) => {
    const normalized = { ...record, investedValue: Number(record.investedValue || 0), currentValue: Number(record.currentValue || 0) }
    if (editing) updateRecord('investments', editing.id, normalized); else addRecord('investments', normalized)
    setEditing(null)
    setCreating(false)
  }

  return <>
    <div className="mb-4 flex justify-end"><Button onClick={() => setCreating(true)}><Plus size={16} />Novo investimento</Button></div>
    {state.investments.length ? <div className="space-y-3">{state.investments.map((item) => {
      const variation = Number(item.investedValue || 0) > 0 ? (Number(item.currentValue || 0) / Number(item.investedValue || 0) - 1) * 100 : 0
      return <Card key={item.id} role="region" aria-label={`Investimento ${item.name}`} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-400/10 font-heading text-violet-300">{item.category?.[0] || 'I'}</div><div className="min-w-0 flex-1"><h3 className="truncate font-medium">{item.name}</h3><p className="text-xs text-slate-500">{item.institution} · {item.category}</p><p className="mt-1 text-xs text-slate-600">Aportado {formatCurrency(item.investedValue)}</p></div><div className="flex items-center justify-between gap-3 sm:justify-end"><div className="text-right"><strong>{formatCurrency(item.currentValue)}</strong><p className={`text-xs ${variation >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{variation.toFixed(1)}%</p></div><button type="button" aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200"><Pencil size={15} /></button><button type="button" aria-label={`Excluir ${item.name}`} onClick={() => setDeleting(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15} /></button></div></Card>
    })}</div> : <EmptyState title="Sua carteira começa aqui" description="Cadastre os investimentos que você já possui para enxergar a distribuição e a evolução." action={<Button onClick={() => setCreating(true)}>Novo investimento</Button>} />}

    <RecordDialog open={creating || Boolean(editing)} title={editing ? 'Editar investimento' : 'Novo investimento'} fields={fields} initial={editing || {}} onClose={() => { setCreating(false); setEditing(null) }} onSave={save} />
    <ConfirmDialog open={Boolean(deleting)} title="Excluir investimento?" description={deleting ? `O investimento ${deleting.name} será removido somente deste navegador.` : ''} confirmLabel="Excluir investimento" onClose={() => setDeleting(null)} onConfirm={() => deleting && removeRecord('investments', deleting.id)} />
  </>
}
