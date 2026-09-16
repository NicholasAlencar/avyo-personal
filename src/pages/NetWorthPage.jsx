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

const scenarios = [{ label: '6%', rate: .06 }, { label: '10%', rate: .10 }, { label: '15%', rate: .15 }]
const recordFields = [
  { name: 'name', label: 'Nome', required: true, wide: true },
  { name: 'type', label: 'Tipo', required: true },
  { name: 'value', label: 'Valor', type: 'number', min: 0, required: true },
]

function CollectionCard({ title, actionLabel, items, protectedRows = [], onAdd, onEdit, onDelete }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-heading text-lg font-semibold">{title}</h2><p className="mt-1 text-xs text-slate-500">Valores mantidos apenas neste dispositivo.</p></div>
        <Button type="button" variant="secondary" onClick={onAdd}><Plus size={15} />{actionLabel}</Button>
      </div>

      <div className="mt-5 space-y-2">
        {protectedRows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] p-4">
            <LockKeyhole size={16} className="text-cyan-300" />
            <div className="min-w-0 flex-1">
              <Link to={row.href} className="font-medium text-cyan-100 underline decoration-cyan-300/30 underline-offset-4 hover:decoration-cyan-200">{row.name}</Link>
              <p className="mt-1 text-xs text-slate-500">Atualizado na área de origem</p>
            </div>
            <strong>{formatCurrency(row.value)}</strong>
            <button type="button" disabled aria-label={`Excluir ${row.name}`} className="grid size-9 place-items-center rounded-lg text-slate-600 disabled:cursor-not-allowed"><Trash2 size={15} /></button>
          </div>
        ))}

        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white/[0.035] p-4">
            <div className="min-w-0 flex-1"><strong className="text-sm">{item.name}</strong><p className="mt-1 text-xs text-slate-500">{item.type || 'Outro'}</p></div>
            <strong>{formatCurrency(item.value)}</strong>
            <div className="flex gap-1">
              <button type="button" aria-label={`Editar ${item.name}`} onClick={() => onEdit(item)} className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[0.05] hover:text-white"><Pencil size={15} /></button>
              <button type="button" aria-label={`Excluir ${item.name}`} onClick={() => onDelete(item)} className="grid size-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}

        {!protectedRows.length && !items.length && <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">Nada cadastrado ainda.</p>}
      </div>
    </Card>
  )
}

export function NetWorthPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [rate, setRate] = useState(.10)
  const [dialog, setDialog] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const finance = useMemo(() => aggregateFinance(state, monthKey()), [state])

  const investmentsValue = useMemo(() => state.investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0), [state.investments])
  const manualAssets = useMemo(() => state.assets.reduce((sum, item) => sum + Number(item.value || 0), 0), [state.assets])
  const liabilitiesTotal = useMemo(() => state.liabilities.reduce((sum, item) => sum + Number(item.value || 0), 0), [state.liabilities])
  const assetsTotal = manualAssets + Number(state.profile.reserveAmount || 0) + investmentsValue
  const netWorth = assetsTotal - liabilitiesTotal
  const points = useMemo(() => projectWealth({ initial: netWorth, monthlyContribution: Math.max(0, finance.result), annualRate: rate, months: 12 }), [netWorth, finance.result, rate])

  const startCreate = (collection) => setDialog({ collection, item: null })
  const startEdit = (collection, item) => setDialog({ collection, item })
  const saveRecord = (record) => {
    const normalized = { ...record, value: Number(record.value || 0) }
    if (dialog.item?.id) updateRecord(dialog.collection, dialog.item.id, normalized)
    else addRecord(dialog.collection, normalized)
  }

  const protectedAssets = [
    { id: 'protected-reserve', name: 'Reserva de emergência', value: Number(state.profile.reserveAmount || 0), href: '/reserva' },
    { id: 'protected-investments', name: 'Investimentos', value: investmentsValue, href: '/investimentos' },
  ]

  return (
    <>
      <PageHeader eyebrow="Visão de longo prazo" title="Patrimônio" subtitle="Veja o que você construiu, o que ainda deve e de onde cada valor vem." />
      <NetWorthSummary assets={assetsTotal} liabilities={liabilitiesTotal} />

      <Card className="mt-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-heading text-xl font-semibold">Evolução em 12 meses</h2><p className="mt-1 text-sm text-slate-500">Aporte mensal usado: {formatCurrency(Math.max(0, finance.result))}</p></div>
          <div className="flex gap-2" aria-label="Cenários de rentabilidade">{scenarios.map((scenario) => <button key={scenario.label} type="button" onClick={() => setRate(scenario.rate)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${rate === scenario.rate ? 'bg-violet-400/15 text-violet-200' : 'bg-white/[0.04] text-slate-500'}`}>{scenario.label}</button>)}</div>
        </div>
        <WealthProjectionChart points={points} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Simulação educativa; retornos não são garantidos.</p><strong aria-label="Patrimônio projetado" className="text-cyan-200">Em 12 meses: {formatCurrency(points.at(-1).balance)}</strong></div>
      </Card>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <CollectionCard
          title="Ativos"
          actionLabel="Adicionar ativo"
          items={state.assets}
          protectedRows={protectedAssets}
          onAdd={() => startCreate('assets')}
          onEdit={(item) => startEdit('assets', item)}
          onDelete={(item) => setPendingDelete({ collection: 'assets', item })}
        />
        <CollectionCard
          title="Passivos"
          actionLabel="Adicionar passivo"
          items={state.liabilities}
          onAdd={() => startCreate('liabilities')}
          onEdit={(item) => startEdit('liabilities', item)}
          onDelete={(item) => setPendingDelete({ collection: 'liabilities', item })}
        />
      </div>

      <RecordDialog
        open={Boolean(dialog)}
        title={dialog?.item ? `Editar ${dialog.collection === 'assets' ? 'ativo' : 'passivo'}` : `Novo ${dialog?.collection === 'assets' ? 'ativo' : 'passivo'}`}
        fields={recordFields}
        initial={dialog?.item || {}}
        onClose={() => setDialog(null)}
        onSave={saveRecord}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir registro?"
        description={pendingDelete ? `${pendingDelete.item.name} será removido do patrimônio local.` : ''}
        confirmLabel="Excluir"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && removeRecord(pendingDelete.collection, pendingDelete.item.id)}
      />
    </>
  )
}
