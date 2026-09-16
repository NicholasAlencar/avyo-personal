import { useMemo, useState } from 'react'
import { CreditCard, Plus, X } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CardVisual } from '../components/avyo/CardVisual'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { EmptyState } from '../components/avyo/EmptyState'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [
  { name: 'name', label: 'Nome do cartão', required: true },
  { name: 'institution', label: 'Instituição', required: true },
  { name: 'brand', label: 'Bandeira', defaultValue: 'Visa' },
  { name: 'last4', label: 'Últimos 4 dígitos', required: true },
  { name: 'limit', label: 'Limite', type: 'number', required: true },
  { name: 'currentBill', label: 'Fatura atual', type: 'number' },
  { name: 'closingDay', label: 'Dia de fechamento', type: 'number' },
  { name: 'dueDay', label: 'Dia de vencimento', type: 'number' },
]

const installmentFields = [
  { name: 'description', label: 'Descrição', required: true, wide: true },
  { name: 'totalValue', label: 'Valor total', type: 'number', required: true },
  { name: 'installmentsCount', label: 'Total de parcelas', type: 'number', required: true },
  { name: 'currentInstallment', label: 'Parcela atual', type: 'number', required: true },
  { name: 'monthlyValue', label: 'Valor mensal', type: 'number', required: true },
]

export function CardsPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [details, setDetails] = useState(null)
  const [installmentCard, setInstallmentCard] = useState(null)
  const monthlyCommitted = useMemo(() => state.cards.reduce((total, card) => total + (Number(card.currentBill) || 0), 0), [state.cards])
  const totalLimit = useMemo(() => state.cards.reduce((total, card) => total + (Number(card.limit) || 0), 0), [state.cards])
  const linked = details ? state.installments.filter((item) => item.cardId === details.id) : []

  return <>
    <RouteNav items={movementNav} />
    <PageHeader eyebrow="Movimentações" title="Cartões" subtitle="Veja a fatura no contexto do seu limite, sem sustos no fechamento." action={<Button onClick={() => setCreating(true)}><Plus size={17} />Novo cartão</Button>} />
    <div className="mb-4 grid gap-3 sm:grid-cols-2"><Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Comprometido em faturas</p><p className="mt-2 font-heading text-2xl font-bold text-cyan-300">{formatCurrency(monthlyCommitted)}</p></Card><Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Limite total</p><p className="mt-2 font-heading text-2xl font-bold">{formatCurrency(totalLimit)}</p></Card></div>
    {state.cards.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{state.cards.map((card) => <CardVisual key={card.id} card={card} onDetails={setDetails} onEdit={setEditing} onDelete={setDeleting} />)}</div> : <EmptyState icon={CreditCard} title="Nenhum cartão cadastrado" description="Cadastre seus cartões para acompanhar faturas, limites e parcelamentos relacionados." action={<Button onClick={() => setCreating(true)}>Novo cartão</Button>} />}

    <RecordDialog open={creating} title="Novo cartão" fields={fields} initial={{ brand: 'Visa', currentBill: 0 }} onClose={() => setCreating(false)} onSave={(record) => addRecord('cards', record)} />
    <RecordDialog open={Boolean(editing)} title="Editar cartão" fields={fields} initial={editing || {}} onClose={() => setEditing(null)} onSave={(record) => updateRecord('cards', editing.id, record)} />
    <ConfirmDialog open={Boolean(deleting)} title="Excluir cartão?" description={deleting ? `O cartão “${deleting.name}” será removido. Parcelamentos existentes não serão apagados.` : ''} confirmLabel="Excluir cartão" onClose={() => setDeleting(null)} onConfirm={() => deleting && removeRecord('cards', deleting.id)} />

    {details && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4" onMouseDown={(event) => event.target === event.currentTarget && setDetails(null)}><section role="dialog" aria-modal="true" aria-label={`Detalhes de ${details.name}`} className="avyo-card my-6 w-full max-w-xl p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-cyan-300">Cartão</p><h2 className="mt-1 font-heading text-xl font-bold">Detalhes de {details.name}</h2><p className="mt-1 text-sm text-slate-500">{details.institution} · •••• {details.last4}</p></div><button type="button" aria-label="Fechar detalhes" onClick={() => setDetails(null)} className="grid size-10 place-items-center rounded-xl bg-white/[0.05]"><X size={18} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Card className="p-4"><p className="text-xs text-slate-500">Fatura atual</p><p className="mt-1 font-semibold">{formatCurrency(details.currentBill)}</p></Card><Card className="p-4"><p className="text-xs text-slate-500">Limite</p><p className="mt-1 font-semibold">{formatCurrency(details.limit)}</p></Card></div><div className="mt-6"><div className="flex items-center justify-between gap-3"><h3 className="font-heading font-semibold">Parcelamentos ligados</h3><span className="text-xs text-slate-500">{linked.length} ativo(s)</span></div>{linked.length ? <div className="mt-3 space-y-2">{linked.map((item) => <div key={item.id} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><div className="flex justify-between gap-3"><span className="font-medium">{item.description}</span><span className="text-cyan-200">{formatCurrency(item.monthlyValue)}/mês</span></div><p className="mt-1 text-xs text-slate-500">Parcela {item.currentInstallment} de {item.installmentsCount}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-500">Nenhum parcelamento vinculado a este cartão.</p>}</div><Button className="mt-6 w-full" onClick={() => { setInstallmentCard(details); setDetails(null) }}>Novo parcelamento neste cartão</Button></section></div>}

    <RecordDialog open={Boolean(installmentCard)} title={`Novo parcelamento · ${installmentCard?.name || ''}`} fields={installmentFields} initial={{ cardId: installmentCard?.id || '', currentInstallment: 1 }} onClose={() => setInstallmentCard(null)} onSave={(record) => addRecord('installments', { ...record, cardId: installmentCard.id, remainingMonths: Math.max(0, Number(record.installmentsCount) - Number(record.currentInstallment)) })} />
  </>
}
