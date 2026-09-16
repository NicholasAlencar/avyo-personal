import { useMemo, useState } from 'react'
import { Pencil, Plus, ReceiptText, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Progress } from '../components/ui/Progress'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { EmptyState } from '../components/avyo/EmptyState'
import { InstallmentTimeline } from '../components/avyo/InstallmentTimeline'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

export function InstallmentsPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fields = useMemo(() => [
    { name: 'description', label: 'Descrição', required: true, wide: true },
    { name: 'cardId', label: 'Cartão', type: 'select', defaultValue: '', options: [{ value: '', label: 'Sem cartão vinculado' }, ...state.cards.map((card) => ({ value: card.id, label: card.name }))] },
    { name: 'totalValue', label: 'Valor total', type: 'number', min: 0, required: true },
    { name: 'installmentsCount', label: 'Total de parcelas', type: 'number', min: 1, required: true },
    { name: 'currentInstallment', label: 'Parcela atual', type: 'number', min: 0, required: true },
    { name: 'monthlyValue', label: 'Valor mensal', type: 'number', min: 0, required: true },
  ], [state.cards])

  const futureInstallments = useMemo(() => state.installments.reduce((total, item) => {
    const remaining = Math.max(0, Number(item.remainingMonths ?? (Number(item.installmentsCount) - Number(item.currentInstallment))) || 0)
    return total + (Number(item.monthlyValue) || 0) * remaining
  }, 0), [state.installments])
  const monthlyInstallments = useMemo(() => state.installments.reduce((total, item) => total + (Number(item.monthlyValue) || 0), 0), [state.installments])

  const normalize = (record) => ({
    ...record,
    totalValue: Number(record.totalValue) || 0,
    installmentsCount: Number(record.installmentsCount) || 0,
    currentInstallment: Number(record.currentInstallment) || 0,
    monthlyValue: Number(record.monthlyValue) || 0,
    remainingMonths: Math.max(0, (Number(record.installmentsCount) || 0) - (Number(record.currentInstallment) || 0)),
  })

  return <>
    <RouteNav items={movementNav} />
    <PageHeader eyebrow="Movimentações" title="Parcelamentos" subtitle="Enxergue por quanto tempo cada compra ainda acompanha você." action={<Button onClick={() => setCreating(true)}><Plus size={17} />Novo parcelamento</Button>} />
    <div className="mb-4 grid gap-3 sm:grid-cols-2"><Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Total futuro</p><p className="mt-2 font-heading text-2xl font-bold text-cyan-300">{formatCurrency(futureInstallments)}</p></Card><Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Compromisso mensal</p><p className="mt-2 font-heading text-2xl font-bold">{formatCurrency(monthlyInstallments)}</p></Card></div>

    {state.installments.length ? <div className="space-y-4">{state.installments.map((item) => {
      const card = state.cards.find((candidate) => candidate.id === item.cardId)
      const count = Math.max(1, Number(item.installmentsCount) || 1)
      const current = Number(item.currentInstallment) || 0
      return <Card key={item.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-heading text-lg font-semibold">{item.description}</h3><p className="text-sm text-slate-500">Parcela {current} de {count}{card ? ` · ${card.name}` : ''}</p></div><div className="flex items-center gap-2"><strong>{formatCurrency(item.monthlyValue)}/mês</strong><button type="button" aria-label={`Editar ${item.description}`} onClick={() => setEditing(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200"><Pencil size={15} /></button><button type="button" aria-label={`Excluir ${item.description}`} onClick={() => setDeleting(item)} className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15} /></button></div></div><div className="mt-5"><Progress value={Math.min(100, current / count * 100)} label={`Progresso de ${item.description}`} /></div><p className="mt-3 text-xs text-slate-500">Faltam {Math.max(0, count - current)} meses · total {formatCurrency(item.totalValue)}</p><InstallmentTimeline installment={item} /></Card>
    })}</div> : <EmptyState icon={ReceiptText} title="Nenhum parcelamento ativo" description="Cadastre compras parceladas para visualizar o impacto que ainda vem pela frente." action={<Button onClick={() => setCreating(true)}>Novo parcelamento</Button>} />}

    <RecordDialog open={creating} title="Novo parcelamento" fields={fields} initial={{ cardId: '', currentInstallment: 1 }} onClose={() => setCreating(false)} onSave={(record) => addRecord('installments', normalize(record))} />
    <RecordDialog open={Boolean(editing)} title="Editar parcelamento" fields={fields} initial={editing || {}} onClose={() => setEditing(null)} onSave={(record) => updateRecord('installments', editing.id, normalize(record))} />
    <ConfirmDialog open={Boolean(deleting)} title="Excluir parcelamento?" description={deleting ? `O parcelamento “${deleting.description}” será removido.` : ''} confirmLabel="Excluir parcelamento" onClose={() => setDeleting(null)} onConfirm={() => deleting && removeRecord('installments', deleting.id)} />
  </>
}
