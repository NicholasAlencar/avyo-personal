import { useMemo, useState } from 'react'
import { FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency, formatDate } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { CsvImportDialog } from '../components/avyo/CsvImportDialog'
import { EmptyState } from '../components/avyo/EmptyState'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { movementNav, RouteNav } from '../components/avyo/RouteNav'

const fields = [
  { name: 'description', label: 'Descrição', required: true, wide: true },
  { name: 'amount', label: 'Valor', type: 'number', min: 0, required: true },
  { name: 'date', label: 'Data', type: 'date', required: true },
  { name: 'category', label: 'Categoria', type: 'select', defaultValue: 'Outros', options: ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Renda', 'Outros'] },
  { name: 'recurring', label: 'Movimentação recorrente', type: 'checkbox' },
]

const selectClass = 'min-h-11 rounded-xl border border-white/10 bg-[#0c1426] px-3 text-sm text-slate-200 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20'

export function TransactionsPage() {
  const { state, addRecord, updateRecord, removeRecord } = useFinanceStore()
  const [createType, setCreateType] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [importOpen, setImportOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const categories = useMemo(() => [...new Set(state.transactions.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [state.transactions])
  const summary = useMemo(() => state.transactions.reduce((totals, item) => {
    const amount = Number(item.amount) || 0
    if (item.type === 'income') totals.income += amount
    else totals.expenses += amount
    return totals
  }, { income: 0, expenses: 0 }), [state.transactions])
  const items = useMemo(() => state.transactions
    .filter((item) => `${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => typeFilter === 'all' || item.type === typeFilter)
    .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
    .sort((a, b) => b.date.localeCompare(a.date)), [state.transactions, query, typeFilter, categoryFilter])

  return <>
    <RouteNav items={movementNav} />
    <PageHeader eyebrow="Movimentações" title="Transações" subtitle="Registre o que entra e sai. O resto do AVYO se ajusta na hora." action={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setImportOpen(true)}><FileUp size={17} />Importar extrato</Button><Button onClick={() => setCreateType('expense')}><Plus size={17} />Nova despesa</Button></div>} />

    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Entradas</p><p className="mt-2 font-heading text-xl font-bold text-emerald-300">{formatCurrency(summary.income)}</p></Card>
      <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Saídas</p><p className="mt-2 font-heading text-xl font-bold text-rose-300">{formatCurrency(summary.expenses)}</p></Card>
      <Card className="p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Saldo</p><p className={`mt-2 font-heading text-xl font-bold ${summary.income - summary.expenses >= 0 ? 'text-cyan-300' : 'text-rose-300'}`}>{formatCurrency(summary.income - summary.expenses)}</p></Card>
    </div>

    <Card className="mt-4 p-4"><div className="grid gap-3 md:grid-cols-[1fr_180px_220px]"><label className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3"><Search size={17} className="text-slate-500" /><span className="sr-only">Buscar</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por descrição ou categoria" className="min-h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600" /></label><label className="grid gap-1 text-xs text-slate-500">Tipo<select aria-label="Tipo" className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">Todos</option><option value="income">Receitas</option><option value="expense">Despesas</option></select></label><label className="grid gap-1 text-xs text-slate-500">Categoria<select aria-label="Categoria" className={selectClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">Todas</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div></Card>

    <div className="mt-4 space-y-2">{items.map((item) => <Card key={item.id} className="flex items-center gap-3 p-4"><div className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.type === 'income' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{item.type === 'income' ? '+' : '−'}</div><div className="min-w-0 flex-1"><h3 className="truncate font-medium">{item.description}</h3><p className="text-xs text-slate-500">{item.category} · {formatDate(item.date)}{item.recurring ? ' · recorrente' : ''}</p></div><strong className={`hidden sm:block ${item.type === 'income' ? 'text-emerald-300' : 'text-slate-200'}`}>{item.type === 'income' ? '+' : '−'} {formatCurrency(item.amount)}</strong><button type="button" aria-label={`Editar ${item.description}`} onClick={() => setEditing(item)} className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-white/[0.06] hover:text-cyan-200"><Pencil size={16} /></button><button type="button" aria-label={`Excluir ${item.description}`} onClick={() => setDeleting(item)} className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={16} /></button></Card>)}</div>

    {state.transactions.length === 0 && <div className="mt-4"><EmptyState title="Nenhuma transação por aqui" description="Adicione sua primeira despesa ou receita para começar a montar sua visão financeira." action={<Button onClick={() => setCreateType('expense')}>Nova despesa</Button>} /></div>}
    {state.transactions.length > 0 && items.length === 0 && <div className="mt-4"><EmptyState title="Nenhuma transação encontrada" description="Tente limpar a busca ou ajustar os filtros." /></div>}

    <div className="fixed bottom-5 right-5 flex gap-2 lg:bottom-8 lg:right-8"><Button variant="secondary" onClick={() => setCreateType('income')}>+ Receita</Button></div>
    <RecordDialog open={Boolean(createType)} title={createType === 'income' ? 'Nova receita' : 'Nova despesa'} fields={fields} initial={{ date: today, category: createType === 'income' ? 'Renda' : 'Outros', recurring: false }} onClose={() => setCreateType(null)} onSave={(record) => addRecord('transactions', { ...record, type: createType })} />
    <RecordDialog open={Boolean(editing)} title="Editar transação" fields={fields} initial={editing || {}} onClose={() => setEditing(null)} onSave={(record) => updateRecord('transactions', editing.id, record)} />
    <ConfirmDialog open={Boolean(deleting)} title="Excluir transação?" description={deleting ? `A transação “${deleting.description}” será removida do seu histórico.` : ''} confirmLabel="Excluir transação" onClose={() => setDeleting(null)} onConfirm={() => deleting && removeRecord('transactions', deleting.id)} />
    <CsvImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={(rows) => rows.forEach((row) => addRecord('transactions', row))} />
  </>
}
