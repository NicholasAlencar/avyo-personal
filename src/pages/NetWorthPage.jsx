import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LockKeyhole, Pencil, Plus, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { formatCurrency, monthKey } from '../lib/format'
import { projectWealth } from '../lib/projections'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { NetWorthSummary } from '../components/avyo/NetWorthSummary'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { WealthProjectionChart } from '../components/avyo/WealthProjectionChart'

const scenarios = [{ label: 'Conservador', rate: .06 }, { label: 'Moderado', rate: .10 }, { label: 'Arrojado', rate: .15 }]
const recordFields = [{ name: 'name', label: 'Nome', required: true }, { name: 'type', label: 'Tipo', required: true }, { name: 'value', label: 'Valor', type: 'number', required: true }]

function EditableList({ title, collection, items, onCreate, onEdit, onDelete }) {
  return <Card className="p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-heading text-lg font-semibold">{title}</h2><Button variant="ghost" onClick={onCreate}><Plus size={15} />Novo {collection === 'assets' ? 'ativo' : 'passivo'}</Button></div><div className="mt-4 space-y-2">{items.length ? items.map((item) => <div key={item.id} role="region" aria-label={`${collection === 'assets' ? 'Ativo' : 'Passivo'} ${item.name}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3"><div className="min-w-0"><p className="truncate text-sm text-slate-200">{item.name}</p><p className="text-xs text-slate-500">{item.type || 'Sem tipo'}</p></div><div className="flex items-center gap-2"><strong className="text-sm">{formatCurrency(item.value)}</strong><button type="button" aria-label={`Editar ${item.name}`} onClick={() => onEdit(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200"><Pencil size={15} /></button><button type="button" aria-label={`Excluir ${item.name}`} onClick={() => onDelete(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15} /></button></div></div>) : <p className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-500">Nenhum item manual cadastrado.</p>}</div></Card>
}

export function NetWorthPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [rate, setRate] = useState(.10)
  const [dialog, setDialog] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const finance = useMemo(() => aggregateFinance(state, monthKey()), [state])
  const investmentsTotal = useMemo(() => state.investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0), [state.investments])
  const manualAssets = useMemo(() => state.assets.reduce((sum, item) => sum + Number(item.value || 0), 0), [state.assets])
  const liabilities = useMemo(() => state.liabilities.reduce((sum, item) => sum + Number(item.value || 0), 0), [state.liabilities])
  const assetsTotal = manualAssets + investmentsTotal
  const netWorth = assetsTotal - liabilities
  const monthlyContribution = Math.max(0, Number(state.profile.monthlyInvestmentGoal || 0) || finance.result)
  const points = useMemo(() => projectWealth({ initial: netWorth, monthlyContribution, annualRate: rate, months: 12 }), [netWorth, monthlyContribution, rate])

  const openCreate = (collection) => setDialog({ collection, item: null })
  const openEdit = (collection, item) => setDialog({ collection, item })
  const save = (record) => {
    const normalized = { ...record, value: Number(record.value || 0) }
    if (dialog.item) updateRecord(dialog.collection, dialog.item.id, normalized); else addRecord(dialog.collection, normalized)
    setDialog(null)
  }

  return <><PageHeader eyebrow="Visão de longo prazo" title="Patrimônio" subtitle="O retrato do que você construiu, descontando o que ainda deve." /><NetWorthSummary assets={assetsTotal} liabilities={liabilities} />

    <div className="mt-5 grid gap-4 md:grid-cols-2"><Card role="region" aria-label="Referência protegida Reserva" className="border-cyan-300/10 p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-cyan-300"><LockKeyhole size={16} /><span className="text-xs font-semibold uppercase tracking-[.14em]">Referência protegida</span></div><h2 className="mt-2 font-heading text-lg font-semibold">Reserva de emergência</h2><strong className="mt-2 block text-xl">{formatCurrency(state.profile.reserveAmount)}</strong><p className="mt-2 text-xs text-slate-500">A reserva é gerenciada na área própria e não é duplicada no total desta tela.</p></div><button type="button" disabled aria-label="Excluir reserva protegida" className="grid size-9 place-items-center rounded-xl text-slate-700"><Trash2 size={15} /></button></div><Link aria-label="Abrir Reserva" to="/reserva" className="mt-4 inline-flex text-sm font-medium text-cyan-300 hover:text-cyan-200">Abrir Reserva →</Link></Card><Card role="region" aria-label="Referência protegida Investimentos" className="border-violet-300/10 p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-violet-300"><LockKeyhole size={16} /><span className="text-xs font-semibold uppercase tracking-[.14em]">Referência protegida</span></div><h2 className="mt-2 font-heading text-lg font-semibold">Investimentos</h2><strong className="mt-2 block text-xl">{formatCurrency(investmentsTotal)}</strong><p className="mt-2 text-xs text-slate-500">A carteira entra no patrimônio, mas é editada somente na área de Investimentos.</p></div><button type="button" disabled aria-label="Excluir investimentos protegidos" className="grid size-9 place-items-center rounded-xl text-slate-700"><Trash2 size={15} /></button></div><Link aria-label="Abrir Investimentos" to="/investimentos" className="mt-4 inline-flex text-sm font-medium text-violet-300 hover:text-violet-200">Abrir Investimentos →</Link></Card></div>

    <Card className="mt-5 p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-heading text-xl font-semibold">Evolução em 12 meses</h2><p className="mt-1 text-sm text-slate-500">Aporte mensal usado: {formatCurrency(monthlyContribution)}</p></div><div className="flex gap-2">{scenarios.map((scenario) => <button key={scenario.label} onClick={() => setRate(scenario.rate)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${rate === scenario.rate ? 'bg-violet-400/15 text-violet-200' : 'bg-white/[0.04] text-slate-500'}`}>{scenario.label}</button>)}</div></div><WealthProjectionChart points={points} /><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Simulação educativa; retornos não são garantidos.</p><strong aria-label="Patrimônio projetado" className="text-cyan-200">Em 12 meses: {formatCurrency(points.at(-1)?.balance || netWorth)}</strong></div></Card>

    <div className="mt-5 grid gap-4 lg:grid-cols-2"><EditableList title="Ativos manuais" collection="assets" items={state.assets} onCreate={() => openCreate('assets')} onEdit={(item) => openEdit('assets', item)} onDelete={(item) => setDeleting({ collection: 'assets', item })} /><EditableList title="Passivos" collection="liabilities" items={state.liabilities} onCreate={() => openCreate('liabilities')} onEdit={(item) => openEdit('liabilities', item)} onDelete={(item) => setDeleting({ collection: 'liabilities', item })} /></div>

    <RecordDialog open={Boolean(dialog)} title={dialog?.item ? `Editar ${dialog.collection === 'assets' ? 'ativo' : 'passivo'}` : `Novo ${dialog?.collection === 'assets' ? 'ativo' : 'passivo'}`} fields={recordFields} initial={dialog?.item || {}} onClose={() => setDialog(null)} onSave={save} />
    <ConfirmDialog open={Boolean(deleting)} title={`Excluir ${deleting?.collection === 'assets' ? 'ativo' : 'passivo'}?`} description={deleting ? `${deleting.item.name} será removido deste navegador.` : ''} confirmLabel={`Excluir ${deleting?.collection === 'assets' ? 'ativo' : 'passivo'}`} onClose={() => setDeleting(null)} onConfirm={() => deleting && removeRecord(deleting.collection, deleting.item.id)} />
  </>
}
