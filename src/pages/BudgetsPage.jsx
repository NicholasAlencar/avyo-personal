import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { monthKey, formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { BudgetBar } from '../components/avyo/BudgetBar'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { planningNav, RouteNav } from '../components/avyo/RouteNav'
const fields = [{ name: 'category', label: 'Categoria', required: true }, { name: 'limit', label: 'Limite mensal', type: 'number', required: true }]
export function BudgetsPage() { const { state, addRecord } = useFinanceStore(); const [open, setOpen] = useState(false); const f = useMemo(() => aggregateFinance(state, monthKey()), [state]); return <><RouteNav items={planningNav} /><PageHeader eyebrow="Planejamento" title="Orçamento" subtitle="Limites gentis: um combinado com você, não uma punição." action={<Button onClick={() => setOpen(true)}><Plus size={17} />Novo limite</Button>} /><Card className="space-y-7 p-6">{state.budgets.map((b) => <BudgetBar key={b.id} budget={b} spent={f.spentByCategory[b.category] || 0} />)}</Card><Card className="mt-4 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Sugestão automática</p><p className="mt-2 text-sm text-slate-300">Seu histórico indica uma faixa de {formatCurrency(Math.max(...Object.values(f.spentByCategory), 0))} para a categoria mais usada. Ajuste sem perder de vista sua realidade.</p></Card><RecordDialog open={open} title="Novo orçamento" fields={fields} onClose={() => setOpen(false)} onSave={(r) => addRecord('budgets', r)} /></> }
