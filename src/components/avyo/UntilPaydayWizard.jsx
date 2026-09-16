import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { detectCommitments } from '../../lib/untilPayday'
import { formatCurrency } from '../../lib/format'
import { Button } from '../ui/Button'

const input = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

const steps = [
  ['Saldo', 'Quanto você tem disponível agora?'],
  ['Data', 'Quando entra o próximo dinheiro?'],
  ['Compromissos', 'O que já tem destino até lá?'],
  ['Proteção', 'Quanto você quer preservar?'],
  ['Revisar', 'Confira antes de criar seu ritmo.'],
]

export function UntilPaydayWizard({ state, onSave }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ balance: '', nextPaymentDate: '', safetyReserve: '' })
  const [selectedIds, setSelectedIds] = useState([])

  const detected = useMemo(
    () => detectCommitments(state, form.nextPaymentDate),
    [state, form.nextPaymentDate],
  )

  const selected = detected.filter((item) => selectedIds.includes(item.id))
  const selectedTotal = selected.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))

  const goNext = () => {
    if (step === 0 && !form.balance) return
    if (step === 1 && !form.nextPaymentDate) return
    if (step === 1 && !selectedIds.length) setSelectedIds(detected.map((item) => item.id))
    setStep((value) => Math.min(4, value + 1))
  }

  const toggle = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const save = () => {
    onSave({
      id: 'payday-plan',
      balance: Number(form.balance || 0),
      nextPaymentDate: form.nextPaymentDate,
      safetyReserve: Number(form.safetyReserve || 0),
      plannedItems: selected,
      extraItems: [],
      paidItemIds: [],
      todaySpent: 0,
      extraIncome: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <section className="avyo-card max-w-2xl p-6" aria-label="Criar plano até receber">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Etapa {step + 1} de 5</p>
          <h2 className="mt-2 font-heading text-xl font-bold">{steps[step][0]}</h2>
          <p className="mt-1 text-sm text-slate-400">{steps[step][1]}</p>
        </div>
        <div className="flex gap-1" aria-hidden="true">
          {steps.map((item, index) => <span key={item[0]} className={`h-1.5 w-8 rounded-full ${index <= step ? 'bg-cyan-300' : 'bg-white/10'}`} />)}
        </div>
      </div>

      <div className="mt-6">
        {step === 0 && (
          <label className="block text-sm text-slate-300">Saldo disponível
            <input className={input} type="number" min="0" step="any" required value={form.balance} onChange={set('balance')} autoFocus />
          </label>
        )}

        {step === 1 && (
          <label className="block text-sm text-slate-300">Próximo recebimento
            <input className={input} type="date" required value={form.nextPaymentDate} onChange={set('nextPaymentDate')} autoFocus />
          </label>
        )}

        {step === 2 && (
          <fieldset aria-label="Compromissos detectados" className="space-y-3">
            <legend className="mb-3 font-heading text-base font-semibold">Compromissos detectados</legend>
            {detected.length ? detected.map((item) => (
              <label key={item.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <span className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} />
                  <span>{item.description}</span>
                </span>
                <strong>{formatCurrency(item.amount)}</strong>
              </label>
            )) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">Nenhum compromisso recorrente foi detectado nesse intervalo. Você ainda pode seguir e planejar manualmente depois.</p>}
          </fieldset>
        )}

        {step === 3 && (
          <label className="block text-sm text-slate-300">Reserva de segurança
            <input className={input} type="number" min="0" step="any" value={form.safetyReserve} onChange={set('safetyReserve')} autoFocus />
            <span className="mt-2 block text-xs text-slate-500">Esse valor fica fora do seu ritmo diário para evitar que o plano consuma toda a margem.</span>
          </label>
        )}

        {step === 4 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Saldo</p><strong className="mt-1 block">{formatCurrency(form.balance)}</strong></div>
            <div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Compromissos</p><strong className="mt-1 block">{formatCurrency(selectedTotal)}</strong></div>
            <div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Proteção</p><strong className="mt-1 block">{formatCurrency(form.safetyReserve)}</strong></div>
            <div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Itens incluídos</p><strong className="mt-1 block">{selected.length}</strong></div>
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
          <ChevronLeft size={16} />Voltar
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={goNext}>Continuar<ChevronRight size={16} /></Button>
        ) : (
          <Button type="button" onClick={save}><Check size={16} />Criar meu ritmo</Button>
        )}
      </div>
    </section>
  )
}
