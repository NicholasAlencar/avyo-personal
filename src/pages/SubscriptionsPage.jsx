import { useState } from 'react'
import { Clock3, Plus } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [{ name: 'name', label: 'Assinatura', required: true }, { name: 'monthlyValue', label: 'Valor mensal', type: 'number', required: true }, { name: 'category', label: 'Categoria', defaultValue: 'Serviços' }, { name: 'lastUsedDate', label: 'Último uso', type: 'date' }]
const today = () => new Date().toISOString().slice(0, 10)
const daysSince = (date) => {
  if (!date) return 999
  const now = new Date()
  const todayAtNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  return Math.floor((todayAtNoon - new Date(`${date}T12:00:00`)) / 86400000)
}
export function SubscriptionsPage() { const { state, addRecord, updateRecord } = useFinanceStore(); const [open, setOpen] = useState(false); return <><RouteNav items={movementNav} /><PageHeader eyebrow="Movimentações" title="Assinaturas" subtitle="Pequenas cobranças ficam grandes quando passam despercebidas." action={<Button onClick={() => setOpen(true)}><Plus size={17} />Nova assinatura</Button>} /><div className="grid gap-4 md:grid-cols-2">{state.subscriptions.map((item) => { const days = daysSince(item.lastUsedDate); return <Card key={item.id} className={`p-5 ${!item.active ? 'opacity-55' : ''}`}><div className="flex items-start justify-between"><div><h3 className="font-heading text-lg font-semibold">{item.name}</h3><p className="text-sm text-slate-500">{item.category} · {formatCurrency(item.monthlyValue * 12)}/ano</p></div><button role="switch" aria-checked={item.active} aria-label={`${item.active ? 'Desativar' : 'Ativar'} ${item.name}`} onClick={() => updateRecord('subscriptions', item.id, { active: !item.active })} className={`relative h-6 w-11 rounded-full transition ${item.active ? 'bg-cyan-500' : 'bg-slate-700'}`}><span className={`absolute top-1 size-4 rounded-full bg-white transition ${item.active ? 'left-6' : 'left-1'}`} /></button></div><p className="mt-5 font-heading text-2xl font-bold">{formatCurrency(item.monthlyValue)}<span className="text-sm font-normal text-slate-500">/mês</span></p>{item.active && days >= 90 && <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-200"><Clock3 size={16} />Sem uso há {Math.floor(days / 30)} meses — vale cancelar?</p>}<div className="mt-4 flex items-center justify-between"><span className="text-xs text-slate-500">{days === 0 ? 'Usado hoje' : `Último uso há ${days} dia(s)`}</span><Button variant="ghost" onClick={() => updateRecord('subscriptions', item.id, { lastUsedDate: today() })}>Usou hoje</Button></div></Card> })}</div><RecordDialog open={open} title="Nova assinatura" fields={fields} initial={{ active: true, lastUsedDate: today() }} onClose={() => setOpen(false)} onSave={(record) => addRecord('subscriptions', record)} /></> }
