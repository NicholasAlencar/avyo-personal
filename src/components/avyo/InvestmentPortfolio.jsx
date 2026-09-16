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
  { name: 'name', label: 'Nome', required: true, wide: true },
  { name: 'institution', label: 'Instituição', required: true },
  { name: 'category', label: 'Categoria', type: 'select', required: true, defaultValue: 'Renda fixa', options: ['Renda fixa', 'Ações', 'Internacional', 'FIIs', 'Outros'] },
  { name: 'investedValue', label: 'Valor aportado', type: 'number', min: 0, required: true },
  { name: 'currentValue', label: 'Valor atual', type: 'number', min: 0, required: true },
  { name: 'date', label: 'Data do primeiro aporte', type: 'date' },
  { name: 'note', label: 'Observação', wide: true },
]

export function InvestmentPortfolio({ investments = [] }) {
  const { addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const startCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const save = (record) => {
    const normalized = {
      ...record,
      investedValue: Number(record.investedValue || 0),
      currentValue: Number(record.currentValue || 0),
      returnRate: Number(record.investedValue || 0) > 0
        ? Math.round(((Number(record.currentValue || 0) / Number(record.investedValue || 0) - 1) * 100) * 100) / 100
        : 0,
    }
    if (editing?.id) updateRecord('investments', editing.id, normalized)
    else addRecord('investments', normalized)
  }

  return (
    <section aria-label="Minha carteira">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">Minha carteira</h2>
          <p className="mt-1 text-sm text-slate-400">Registre seus investimentos para acompanhar a composição localmente.</p>
        </div>
        <Button type="button" onClick={startCreate}><Plus size={16} />Adicionar investimento</Button>
      </div>

      {investments.length ? (
        <div className="space-y-3">
          {investments.map((item) => {
            const invested = Number(item.investedValue || 0)
            const current = Number(item.currentValue || 0)
            const returnPct = invested > 0 ? ((current / invested - 1) * 100) : 0
            return (
              <Card key={item.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="grid size-11 place-items-center rounded-xl bg-violet-400/10 font-heading text-violet-300">{item.category?.[0] || 'I'}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium">{item.name}</h3>
                  <p className="text-xs text-slate-500">{item.institution} · {item.category}</p>
                </div>
                <div className="text-right">
                  <strong>{formatCurrency(current)}</strong>
                  <p className={`text-xs ${returnPct >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{returnPct.toFixed(1)}%</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label={`Editar ${item.name}`} onClick={() => { setEditing(item); setOpen(true) }} className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-white/[0.05] hover:text-white"><Pencil size={16} /></button>
                  <button type="button" aria-label={`Excluir ${item.name}`} onClick={() => setPendingDelete(item)} className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={16} /></button>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState title="Sua carteira ainda está vazia" description="Adicione o primeiro investimento para acompanhar aportes e evolução." actionLabel="Adicionar investimento" onAction={startCreate} />
      )}

      <RecordDialog
        open={open}
        title={editing ? 'Editar investimento' : 'Novo investimento'}
        fields={fields}
        initial={editing || { category: 'Renda fixa', date: new Date().toISOString().slice(0, 10) }}
        onClose={() => setOpen(false)}
        onSave={save}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir investimento?"
        description={pendingDelete ? `${pendingDelete.name} será removido apenas deste dispositivo.` : ''}
        confirmLabel="Excluir"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && removeRecord('investments', pendingDelete.id)}
      />
    </section>
  )
}
