import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { buildBudgetRows } from '../lib/budgets'
import { monthKey } from '../lib/format'
import { Button } from '../components/ui/Button'
import { BudgetBar } from '../components/avyo/BudgetBar'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { planningNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [
  { name: 'category', label: 'Categoria', required: true },
  { name: 'limit', label: 'Limite mensal', type: 'number', min: 0, required: true },
]

export function BudgetsPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const rows = useMemo(() => buildBudgetRows(state, monthKey()), [state])
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const openNew = (row) => setEditing({
    category: row?.category || rows[0]?.category || 'Alimentação',
    limit: row?.suggested || '',
  })

  const saveBudget = (record) => {
    const normalized = { category: String(record.category || '').trim(), limit: Number(record.limit || 0) }
    if (editing?.id) {
      updateRecord('budgets', editing.id, normalized)
      return
    }
    const existing = state.budgets.find((budget) => budget.category === normalized.category)
    if (existing) updateRecord('budgets', existing.id, normalized)
    else addRecord('budgets', normalized)
  }

  return <>
    <RouteNav items={planningNav} />
    <PageHeader eyebrow="Planejamento" title="Orçamento" subtitle="Limites gentis: um combinado com você, não uma punição." action={<Button onClick={() => openNew()}><Plus size={17} />Novo limite</Button>} />

    <div className="grid gap-4 lg:grid-cols-2">
      {rows.map((row) => <BudgetBar key={row.category} item={row} onCreate={openNew} onEdit={setEditing} onDelete={setPendingDelete} />)}
    </div>

    <RecordDialog
      open={Boolean(editing)}
      title={editing?.id ? `Editar ${editing.category}` : 'Novo orçamento'}
      initial={editing || {}}
      fields={fields}
      onClose={() => setEditing(null)}
      onSave={saveBudget}
    />

    <ConfirmDialog
      open={Boolean(pendingDelete)}
      title="Excluir orçamento?"
      description={pendingDelete ? `O limite de ${pendingDelete.category} será removido, mas seus gastos continuam registrados.` : ''}
      confirmLabel="Excluir orçamento"
      onClose={() => setPendingDelete(null)}
      onConfirm={() => pendingDelete && removeRecord('budgets', pendingDelete.id)}
    />
  </>
}
