import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { Button } from '../components/ui/Button'
import { CardVisual } from '../components/avyo/CardVisual'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [{ name: 'name', label: 'Nome do cartão', required: true }, { name: 'institution', label: 'Instituição', required: true }, { name: 'brand', label: 'Bandeira', defaultValue: 'Visa' }, { name: 'last4', label: 'Últimos 4 dígitos', required: true }, { name: 'limit', label: 'Limite', type: 'number', required: true }, { name: 'currentBill', label: 'Fatura atual', type: 'number' }, { name: 'closingDay', label: 'Dia de fechamento', type: 'number' }, { name: 'dueDay', label: 'Dia de vencimento', type: 'number' }]
export function CardsPage() { const { state, addRecord } = useFinanceStore(); const [open, setOpen] = useState(false); return <><RouteNav items={movementNav} /><PageHeader eyebrow="Movimentações" title="Cartões" subtitle="Veja a fatura no contexto do seu limite, sem sustos no fechamento." action={<Button onClick={() => setOpen(true)}><Plus size={17} />Novo cartão</Button>} /><div className="grid gap-4 md:grid-cols-2">{state.cards.map((card) => <CardVisual key={card.id} card={card} />)}</div><RecordDialog open={open} title="Novo cartão" fields={fields} onClose={() => setOpen(false)} onSave={(record) => addRecord('cards', record)} /></> }
