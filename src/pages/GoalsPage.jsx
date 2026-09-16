import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { GoalCard } from '../components/avyo/GoalCard'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { planningNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [
  { name: 'name', label: 'Nome da meta', required: true },
  { name: 'total', label: 'Valor desejado', type: 'number', min: 0, required: true },
  { name: 'saved', label: 'Já guardado', type: 'number', min: 0 },
  { name: 'deadline', label: 'Prazo', type: 'date', required: true },
]

export function GoalsPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const saveGoal = (record) => {
    const normalized = {
      name: String(record.name || '').trim(),
      total: Number(record.total || 0),
      saved: Number(record.saved || 0),
      deadline: record.deadline,
    }
    if (editing?.id) updateRecord('goals', editing.id, normalized)
    else addRecord('goals', normalized)
  }

  const deposit = (goal, amount) => updateRecord('goals', goal.id, {
    saved: Math.min(Number(goal.total || 0), Number(goal.saved || 0) + amount),
  })

  return <>
    <RouteNav items={planningNav} />
    <PageHeader eyebrow="Planejamento" title="Metas" subtitle="Transforme desejos em um valor mensal que cabe no presente." action={<Button onClick={() => setEditing({ saved: 0 })}><Plus size={17} />Nova meta</Button>} />

    <div className="grid gap-4 md:grid-cols-2">
      {state.goals.map((goal) => <GoalCard key={goal.id} goal={goal} onDeposit={deposit} onEdit={setEditing} onDelete={setPendingDelete} />)}
    </div>

    <RecordDialog
      open={Boolean(editing)}
      title={editing?.id ? 'Editar meta' : 'Nova meta'}
      initial={editing || {}}
      fields={fields}
      onClose={() => setEditing(null)}
      onSave={saveGoal}
    />

    <ConfirmDialog
      open={Boolean(pendingDelete)}
      title="Excluir meta?"
      description={pendingDelete ? `A meta ${pendingDelete.name} será removida. Essa ação não altera outras movimentações.` : ''}
      confirmLabel="Excluir meta"
      onClose={() => setPendingDelete(null)}
      onConfirm={() => pendingDelete && removeRecord('goals', pendingDelete.id)}
    />
  </>
}
