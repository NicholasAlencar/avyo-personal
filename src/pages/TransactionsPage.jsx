import { useMemo, useState } from 'react'
import { FileUp, Plus, Search, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency, formatDate } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CsvImportDialog } from '../components/avyo/CsvImportDialog'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [
  { name: 'description', label: 'Descrição', required: true, wide: true }, { name: 'amount', label: 'Valor', type: 'number', min: 0, required: true },
  { name: 'date', label: 'Data', type: 'date', required: true }, { name: 'category', label: 'Categoria', type: 'select', defaultValue: 'Outros', options: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Renda', 'Outros'] },
  { name: 'recurring', label: 'Movimentação recorrente', type: 'checkbox' },
]

export function TransactionsPage() {
  const { state, addRecord, removeRecord } = useFinanceStore()
  const [type, setType] = useState(null)
  const [query, setQuery] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const items = useMemo(() => state.transactions.filter((item) => `${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date)), [state.transactions, query])
  return <><RouteNav items={movementNav} /><PageHeader eyebrow="Movimentações" title="Transações" subtitle="Registre o que entra e sai. O resto do AVYO se ajusta na hora." action={<div className="flex gap-2"><Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp size={17} />Importar CSV</Button><Button onClick={() => setType('expense')}><Plus size={17} />Nova despesa</Button></div>} /><Card className="p-4"><label className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3"><Search size={17} className="text-slate-500" /><span className="sr-only">Buscar</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por descrição ou categoria" className="min-h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600" /></label></Card><div className="mt-4 space-y-2">{items.map((item) => <Card key={item.id} className="flex items-center gap-4 p-4"><div className={`grid size-10 place-items-center rounded-xl ${item.type === 'income' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{item.type === 'income' ? '+' : '−'}</div><div className="min-w-0 flex-1"><h3 className="truncate font-medium">{item.description}</h3><p className="text-xs text-slate-500">{item.category} · {formatDate(item.date)}</p></div><strong className={item.type === 'income' ? 'text-emerald-300' : 'text-slate-200'}>{item.type === 'income' ? '+' : '−'} {formatCurrency(item.amount)}</strong><button aria-label={`Excluir ${item.description}`} onClick={() => window.confirm('Excluir esta transação?') && removeRecord('transactions', item.id)} className="grid size-10 place-items-center rounded-xl text-slate-600 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={16} /></button></Card>)}</div><div className="fixed bottom-5 right-5 flex gap-2 lg:bottom-8 lg:right-8"><Button variant="secondary" onClick={() => setType('income')}>+ Receita</Button></div><RecordDialog open={Boolean(type)} title={type === 'income' ? 'Nova receita' : 'Nova despesa'} fields={fields} initial={{ date: today, category: type === 'income' ? 'Renda' : 'Outros', recurring: false }} onClose={() => setType(null)} onSave={(record) => addRecord('transactions', { ...record, type })} /><CsvImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={(rows) => rows.forEach((row) => addRecord('transactions', row))} /></>
}
