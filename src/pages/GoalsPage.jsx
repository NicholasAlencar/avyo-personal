import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { Button } from '../components/ui/Button'
import { GoalCard } from '../components/avyo/GoalCard'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { planningNav, RouteNav } from '../components/avyo/RouteNav'
const fields = [{ name: 'name', label: 'Nome da meta', required: true }, { name: 'total', label: 'Valor desejado', type: 'number', required: true }, { name: 'saved', label: 'Já guardado', type: 'number' }, { name: 'deadline', label: 'Prazo', type: 'date', required: true }]
export function GoalsPage() { const { state, addRecord } = useFinanceStore(); const [open, setOpen] = useState(false); return <><RouteNav items={planningNav} /><PageHeader eyebrow="Planejamento" title="Metas" subtitle="Transforme desejos em um valor mensal que cabe no presente." action={<Button onClick={() => setOpen(true)}><Plus size={17} />Nova meta</Button>} /><div className="grid gap-4 md:grid-cols-2">{state.goals.map((g) => <GoalCard key={g.id} goal={g} />)}</div><RecordDialog open={open} title="Nova meta" fields={fields} onClose={() => setOpen(false)} onSave={(r) => addRecord('goals', r)} /></> }
