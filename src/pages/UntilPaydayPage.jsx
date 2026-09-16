import { useMemo, useState } from 'react'
import { CalendarClock, RefreshCw, Wallet } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { calculateUntilPayday, detectCommitments, simulatePayday } from '../lib/untilPayday'
import { createId } from '../data/schema'
import { formatCurrency, formatDate } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { PaydayBreakdown } from '../components/avyo/PaydayBreakdown'
import { planningNav, RouteNav } from '../components/avyo/RouteNav'
import { UntilPaydayWizard } from '../components/avyo/UntilPaydayWizard'

export function UntilPaydayPage() {
  const { state, updatePaydayPlan } = useFinanceStore()
  const [expenseSimulation, setExpenseSimulation] = useState('')
  const [incomeSimulation, setIncomeSimulation] = useState('')
  const [notice, setNotice] = useState('')
  const detectedItems = useMemo(() => detectCommitments(state), [state])
  const plan = state.atePagamento
  const result = useMemo(() => plan ? calculateUntilPayday(plan) : null, [plan])
  const expensePreview = useMemo(() => plan && Number(expenseSimulation) > 0 ? simulatePayday(plan, { amount: Number(expenseSimulation), type: 'expense' }) : null, [plan, expenseSimulation])
  const incomePreview = useMemo(() => plan && Number(incomeSimulation) > 0 ? simulatePayday(plan, { amount: Number(incomeSimulation), type: 'income' }) : null, [plan, incomeSimulation])

  if (!result) return <><RouteNav items={planningNav} /><PageHeader eyebrow="Planejamento" title="Até receber" subtitle="Descubra um ritmo possível até o próximo dinheiro entrar." /><UntilPaydayWizard detectedItems={detectedItems} onSave={updatePaydayPlan} /></>

  const patchPlan = (patch) => updatePaydayPlan((current) => ({ ...current, ...patch }))
  const togglePaid = (id) => updatePaydayPlan((current) => {
    const paid = current.paidItemIds || []
    return { ...current, paidItemIds: paid.includes(id) ? paid.filter((itemId) => itemId !== id) : [...paid, id] }
  })
  const registerItem = (type) => {
    const raw = type === 'income' ? incomeSimulation : expenseSimulation
    const amount = Number(raw || 0)
    if (!(amount > 0)) return
    updatePaydayPlan((current) => ({
      ...current,
      extraItems: [...(current.extraItems || []), { id: createId('payday-item'), description: type === 'income' ? 'Renda extra' : 'Gasto simulado', amount, type }],
    }))
    if (type === 'income') setIncomeSimulation(''); else setExpenseSimulation('')
    setNotice(type === 'income' ? 'Renda extra registrada no plano.' : 'Gasto registrado no plano.')
  }

  return <>
    <RouteNav items={planningNav} />
    <PageHeader eyebrow="Planejamento" title="Até receber" subtitle={`Seu plano vai até ${formatDate(plan.nextPaymentDate)}.`} action={<Button variant="ghost" onClick={() => updatePaydayPlan(null)}><RefreshCw size={16} />Refazer plano</Button>} />

    <Card className="relative overflow-hidden p-7"><div className="absolute -right-16 -top-16 size-52 rounded-full bg-cyan-400/10 blur-3xl" /><div className="relative grid gap-7 md:grid-cols-4"><div className="md:col-span-2"><p className="text-sm text-slate-400">Ritmo diário</p><h2 className="mt-2 font-heading text-4xl font-bold text-gradient">{formatCurrency(result.dailyRhythm)}</h2><p className="mt-3 text-sm text-slate-300">por dia durante os próximos {result.days} dias.</p></div><div className="space-y-3 rounded-2xl bg-white/[0.04] p-4"><p className="flex items-center gap-2 text-sm text-slate-400"><Wallet size={16} />Livre agora</p><strong className="font-heading text-xl">{formatCurrency(result.remainingFree)}</strong><p className="flex items-center gap-2 text-xs text-slate-500"><CalendarClock size={14} />Reserva de segurança preservada</p></div><div className="space-y-3 rounded-2xl bg-white/[0.04] p-4"><p className="text-sm text-slate-400">Ritmo semanal</p><strong className="font-heading text-xl">{formatCurrency(result.weeklyRhythm)}</strong><p className="text-xs text-slate-500">Status: {result.status === 'healthy' ? 'saudável' : result.status === 'attention' ? 'atenção' : 'crítico'}</p></div></div></Card>

    <PaydayBreakdown plan={plan} result={result} onTogglePaid={togglePaid} onTodaySpent={(value) => patchPlan({ todaySpent: Math.max(0, value) })} />

    <Card className="mt-4 p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">What if</p><h2 className="mt-1 font-heading text-xl font-semibold">Teste antes de registrar</h2></div>{notice && <p role="status" className="text-sm text-cyan-200">{notice}</p>}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"><label className="block text-sm text-slate-300">Simular gasto<input aria-label="Simular gasto" type="number" min="0" step="any" value={expenseSimulation} onChange={(event) => setExpenseSimulation(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50" /></label>{expensePreview && <p className={`mt-3 text-sm ${expensePreview.remainingFree >= 0 ? 'text-cyan-200' : 'text-rose-300'}`}>Se registrar este gasto, restariam {formatCurrency(expensePreview.remainingFree)} — {formatCurrency(expensePreview.dailyRhythm)} por dia.</p>}<Button type="button" className="mt-4 w-full" disabled={!expensePreview} onClick={() => registerItem('expense')}>Registrar gasto no plano</Button></div><div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"><label className="block text-sm text-slate-300">Simular renda extra<input aria-label="Simular renda extra" type="number" min="0" step="any" value={incomeSimulation} onChange={(event) => setIncomeSimulation(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50" /></label>{incomePreview && <p className="mt-3 text-sm text-emerald-200">Com essa entrada, ficariam {formatCurrency(incomePreview.remainingFree)} livres — {formatCurrency(incomePreview.dailyRhythm)} por dia.</p>}<Button type="button" className="mt-4 w-full" disabled={!incomePreview} onClick={() => registerItem('income')}>Registrar renda extra</Button></div></div></Card>
  </>
}
