import { useMemo, useState } from 'react'
import { CalendarClock, RefreshCw, TrendingUp, Wallet } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { calculateUntilPayday, simulatePayday } from '../lib/untilPayday'
import { formatCurrency, formatDate } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { planningNav, RouteNav } from '../components/avyo/RouteNav'
import { UntilPaydayWizard } from '../components/avyo/UntilPaydayWizard'
import { PaydayBreakdown } from '../components/avyo/PaydayBreakdown'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

export function UntilPaydayPage() {
  const { state, updatePaydayPlan } = useFinanceStore()
  const [expenseSimulation, setExpenseSimulation] = useState('')
  const [incomeSimulation, setIncomeSimulation] = useState('')
  const [notice, setNotice] = useState('')

  const plan = state.atePagamento
  const result = useMemo(() => plan ? calculateUntilPayday(plan) : null, [plan])
  const expensePreview = useMemo(
    () => plan && expenseSimulation ? simulatePayday(plan, { type: 'expense', amount: expenseSimulation }) : null,
    [plan, expenseSimulation],
  )
  const incomePreview = useMemo(
    () => plan && incomeSimulation ? simulatePayday(plan, { type: 'income', amount: incomeSimulation }) : null,
    [plan, incomeSimulation],
  )

  const save = (next) => updatePaydayPlan(next)

  if (!result || !plan) {
    return (
      <>
        <RouteNav items={planningNav} />
        <PageHeader eyebrow="Planejamento" title="Até receber" subtitle="Descubra um ritmo possível até o próximo dinheiro entrar." />
        <UntilPaydayWizard state={state} onSave={save} />
      </>
    )
  }

  const togglePaid = (id) => {
    updatePaydayPlan((current) => {
      const ids = current?.paidItemIds || []
      const paidItemIds = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
      return { ...current, paidItemIds }
    })
  }

  const registerExpense = () => {
    const amount = Math.max(0, Number(expenseSimulation || 0))
    if (!amount) return
    updatePaydayPlan((current) => ({ ...current, todaySpent: Number(current?.todaySpent || 0) + amount }))
    setExpenseSimulation('')
    setNotice(`Gasto de ${formatCurrency(amount)} registrado no plano.`)
  }

  const registerIncome = () => {
    const amount = Math.max(0, Number(incomeSimulation || 0))
    if (!amount) return
    updatePaydayPlan((current) => ({ ...current, extraIncome: Number(current?.extraIncome || 0) + amount }))
    setIncomeSimulation('')
    setNotice(`Entrada de ${formatCurrency(amount)} registrada no plano.`)
  }

  return (
    <>
      <RouteNav items={planningNav} />
      <PageHeader
        eyebrow="Planejamento"
        title="Até receber"
        subtitle={`Seu plano vai até ${formatDate(plan.nextPaymentDate)}.`}
        action={<Button variant="ghost" onClick={() => save(null)}><RefreshCw size={16} />Refazer plano</Button>}
      />

      {notice && <div role="status" className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{notice}</div>}

      <Card className="relative overflow-hidden p-7">
        <div className="absolute -right-16 -top-16 size-52 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative grid gap-5 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-sm text-slate-400">Ritmo diário</p>
            <h2 className="mt-2 font-heading text-4xl font-bold text-gradient">{formatCurrency(result.dailyRhythm)}</h2>
            <p className="mt-3 text-sm text-slate-300">por dia durante os próximos {result.days} dias.</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="flex items-center gap-2 text-sm text-slate-400"><TrendingUp size={16} />Ritmo semanal</p>
            <strong className="mt-2 block font-heading text-xl">{formatCurrency(result.weeklyRhythm)}</strong>
            <p className="mt-2 text-xs text-slate-500">Referência de 7 dias, sem obrigar gasto.</p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <p className="flex items-center gap-2 text-sm text-slate-400"><Wallet size={16} />Livre agora</p>
            <strong className="mt-2 block font-heading text-xl">{formatCurrency(result.remainingFree)}</strong>
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><CalendarClock size={14} />Proteção preservada</p>
          </div>
        </div>
      </Card>

      <div className="mt-4">
        <PaydayBreakdown plan={plan} result={result} onTogglePaid={togglePaid} />
      </div>

      <Card className="mt-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What if</p>
          <h2 className="mt-2 font-heading text-lg font-semibold">Teste antes de mexer na margem</h2>
          <p className="mt-1 text-sm text-slate-400">Simule primeiro. Só entra no plano quando você registrar.</p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <label className="block text-sm text-slate-300">E se gastar hoje
              <input type="number" min="0" step="any" value={expenseSimulation} onChange={(event) => setExpenseSimulation(event.target.value)} className={inputClass} />
            </label>
            {expensePreview && <p className={`mt-3 text-sm ${expensePreview.remainingFree >= 0 ? 'text-cyan-200' : 'text-rose-300'}`}>Depois dessa compra, restariam {formatCurrency(expensePreview.remainingFree)} — cerca de {formatCurrency(expensePreview.dailyRhythm)} por dia.</p>}
            <Button type="button" className="mt-4" disabled={!Number(expenseSimulation)} onClick={registerExpense}>Registrar gasto</Button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <label className="block text-sm text-slate-300">E se entrar um dinheiro extra
              <input type="number" min="0" step="any" value={incomeSimulation} onChange={(event) => setIncomeSimulation(event.target.value)} className={inputClass} />
            </label>
            {incomePreview && <p className="mt-3 text-sm text-emerald-200">Com essa entrada, sua margem iria para {formatCurrency(incomePreview.remainingFree)} — cerca de {formatCurrency(incomePreview.dailyRhythm)} por dia.</p>}
            <Button type="button" className="mt-4" disabled={!Number(incomeSimulation)} onClick={registerIncome}>Registrar entrada</Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
          <span>{formatCurrency(plan.todaySpent || 0)} gastos hoje</span>
          <span aria-hidden="true">•</span>
          <span>{formatCurrency(plan.extraIncome || 0)} de entradas extras</span>
        </div>
      </Card>
    </>
  )
}
