import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Progress } from '../components/ui/Progress'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [{ name: 'description', label: 'Descrição', required: true, wide: true }, { name: 'totalValue', label: 'Valor total', type: 'number', required: true }, { name: 'installmentsCount', label: 'Total de parcelas', type: 'number', required: true }, { name: 'currentInstallment', label: 'Parcela atual', type: 'number', required: true }, { name: 'monthlyValue', label: 'Valor mensal', type: 'number', required: true }]
export function InstallmentsPage() { const { state, addRecord } = useFinanceStore(); const [open, setOpen] = useState(false); return <><RouteNav items={movementNav} /><PageHeader eyebrow="Movimentações" title="Parcelamentos" subtitle="Enxergue por quanto tempo cada compra ainda acompanha você." action={<Button onClick={() => setOpen(true)}><Plus size={17} />Novo parcelamento</Button>} /><div className="space-y-4">{state.installments.map((item) => <Card key={item.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-heading text-lg font-semibold">{item.description}</h3><p className="text-sm text-slate-500">Parcela {item.currentInstallment} de {item.installmentsCount}</p></div><strong>{formatCurrency(item.monthlyValue)}/mês</strong></div><div className="mt-5"><Progress value={item.currentInstallment / item.installmentsCount * 100} label={`Progresso de ${item.description}`} /></div><p className="mt-3 text-xs text-slate-500">Faltam {Math.max(0, item.installmentsCount - item.currentInstallment)} meses · total {formatCurrency(item.totalValue)}</p></Card>)}</div><RecordDialog open={open} title="Novo parcelamento" fields={fields} onClose={() => setOpen(false)} onSave={(record) => addRecord('installments', { ...record, remainingMonths: record.installmentsCount - record.currentInstallment })} /></> }
