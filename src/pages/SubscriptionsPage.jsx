import { useMemo, useState } from 'react'
import { Clock3, Pencil, Plus, Repeat2, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { EmptyState } from '../components/avyo/EmptyState'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [
  { name: 'name', label: 'Assinatura', required: true },
  { name: 'monthlyValue', label: 'Valor mensal', type: 'number', min: 0, required: true },
  { name: 'category', label: 'Categoria', defaultValue: 'Serviços' },
  { name: 'lastUsedDate', label: 'Último uso', type: 'date' },
]
const today = () => new Date().toISOString().slice(0, 10)
const daysSince = (date) => {
  if (!date) return 999
  const now = new Date()
  const todayAtNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  return Math.max(0, Math.floor((todayAtNoon - new Date(`${date}T12:00:00`)) / 86400000))
}

export function SubscriptionsPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const monthlySubscriptions = useMemo(() => state.subscriptions.filter((item) => item.active).reduce((total, item) => total + (Number(item.monthlyValue) || 0), 0), [state.subscriptions])
  const annualSubscriptions = monthlySubscriptions * 12

  return <>
    <RouteNav items={movementNav} />
    <PageHeader eyebrow="Movimentações" title="Assinaturas" subtitle="Pequenas cobranças ficam grandes quando passam despercebidas." action={<Button onClick={() => setCreating(true)}><Plus size={17} />Nova assinatura</Button>} />
    <div className="mb-4 grid gap-3 sm:grid-cols-2"><Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Ativas por mês</p><p className="mt-2 font-heading text-2xl font-bold text-cyan-300">{formatCurrency(monthlySubscriptions)}</p></Card><Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Ativas por ano</p><p className="mt-2 font-heading text-2xl font-bold">{formatCurrency(annualSubscriptions)}</p></Card></div>

    {state.subscriptions.length ? <div className="grid gap-4 md:grid-cols-2">{state.subscriptions.map((item) => {
      const days = daysSince(item.lastUsedDate)
      return <Card key={item.id} className={`p-5 ${!item.active ? 'opacity-55' : ''}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-heading text-lg font-semibold">{item.name}</h3><p className="text-sm text-slate-500">{item.category} · {formatCurrency((Number(item.monthlyValue) || 0) * 12)}/ano</p></div><div className="flex items-center gap-1"><button type="button" aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200"><Pencil size={15} /></button><button type="button" aria-label={`Excluir ${item.name}`} onClick={() => setDeleting(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15} /></button><button role="switch" aria-checked={item.active} aria-label={`${item.active ? 'Desativar' : 'Ativar'} ${item.name}`} onClick={() => updateRecord('subscriptions', item.id, { active: !item.active })} className={`relative ml-1 h-6 w-11 rounded-full transition ${item.active ? 'bg-cyan-500' : 'bg-slate-700'}`}><span className={`absolute top-1 size-4 rounded-full bg-white transition ${item.active ? 'left-6' : 'left-1'}`} /></button></div></div><p className="mt-5 font-heading text-2xl font-bold">{formatCurrency(item.monthlyValue)}<span className="text-sm font-normal text-slate-500">/mês</span></p>{item.active && days >= 90 && <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-200"><Clock3 size={16} />Sem uso há {Math.floor(days / 30)} meses — vale cancelar?</p>}<div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-slate-500">{days === 0 ? 'Usado hoje' : `Último uso há ${days} dia(s)`}</span><Button variant="ghost" onClick={() => updateRecord('subscriptions', item.id, { lastUsedDate: today() })}>Usou hoje</Button></div></Card>
    })}</div> : <EmptyState icon={Repeat2} title="Nenhuma assinatura cadastrada" description="Cadastre serviços recorrentes para entender quanto eles consomem por mês e por ano." action={<Button onClick={() => setCreating(true)}>Nova assinatura</Button>} />}

    <RecordDialog open={creating} title="Nova assinatura" fields={fields} initial={{ active: true, lastUsedDate: today(), category: 'Serviços' }} onClose={() => setCreating(false)} onSave={(record) => addRecord('subscriptions', { ...record, monthlyValue: Number(record.monthlyValue) || 0 })} />
    <RecordDialog open={Boolean(editing)} title="Editar assinatura" fields={fields} initial={editing || {}} onClose={() => setEditing(null)} onSave={(record) => updateRecord('subscriptions', editing.id, { ...record, monthlyValue: Number(record.monthlyValue) || 0 })} />
    <ConfirmDialog open={Boolean(deleting)} title="Excluir assinatura?" description={deleting ? `A assinatura “${deleting.name}” será removida.` : ''} confirmLabel="Excluir assinatura" onClose={() => setDeleting(null)} onConfirm={() => deleting && removeRecord('subscriptions', deleting.id)} />
  </>
}
