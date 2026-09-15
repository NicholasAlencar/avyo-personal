import { ArrowDownRight, ArrowUpRight, Equal } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts'
import { formatCurrency } from '../../lib/format'
import { Card } from '../ui/Card'

export function MonthSummary({ finance }) {
  const data = [{ name: 'Entrou', value: finance.income, color: '#34d399' }, { name: 'Saiu', value: finance.expenses, color: '#fb7185' }]
  const rows = [['Entrou', finance.income, ArrowUpRight, 'text-emerald-300'], ['Saiu', finance.expenses, ArrowDownRight, 'text-rose-300'], ['Sobrou', finance.result, Equal, finance.result >= 0 ? 'text-cyan-300' : 'text-rose-300']]
  return <Card className="p-5"><h2 className="font-heading text-lg font-semibold">Resumo do mês</h2><div className="mt-5 grid gap-5 sm:grid-cols-[1fr_170px]"><div className="space-y-4">{rows.map(([label, value, Icon, tone]) => <div key={label} className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-400"><Icon size={16} className={tone} />{label}</span><strong className={`font-heading ${tone}`}>{formatCurrency(value)}</strong></div>)}</div><div className="h-24" aria-label={`Entrou ${formatCurrency(finance.income)} e saiu ${formatCurrency(finance.expenses)}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} /><Bar dataKey="value" radius={[7, 7, 2, 2]}>{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Bar></BarChart></ResponsiveContainer></div></div></Card>
}
