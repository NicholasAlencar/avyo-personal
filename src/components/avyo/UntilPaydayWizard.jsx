import { useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../lib/format'

const input = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

const steps = [
  ['Quanto você tem agora?', 'Comece pelo saldo realmente disponível.'],
  ['Quando entra dinheiro de novo?', 'Defina a data que encerra este plano.'],
  ['O que já está comprometido?', 'Revise compromissos detectados e acrescente algo que ficou de fora.'],
  ['Quanto quer preservar?', 'Separe uma reserva de segurança para não planejar até o limite.'],
  ['Revise seu plano', 'Confirme os números antes de criar o ritmo.'],
]

export function UntilPaydayWizard({ onSave, detectedItems = [] }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ balance: '', nextPaymentDate: '', safetyReserve: '', manualDescription: '', manualAmount: '' })
  const [selectedIds, setSelectedIds] = useState(() => detectedItems.map((item) => item.id))
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))

  const selectedDetected = useMemo(() => detectedItems.filter((item) => selectedIds.includes(item.id)), [detectedItems, selectedIds])
  const manualItem = Number(form.manualAmount || 0) > 0 ? [{ id: 'manual-commitment', description: form.manualDescription || 'Compromisso manual', amount: Number(form.manualAmount), type: 'expense', source: 'manual' }] : []
  const plannedItems = [...selectedDetected, ...manualItem]
  const committed = plannedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const canContinue = step === 0 ? Number(form.balance) >= 0 && form.balance !== '' : step === 1 ? Boolean(form.nextPaymentDate) : true

  const finish = () => onSave({
    id: 'payday-plan',
    balance: Number(form.balance),
    nextPaymentDate: form.nextPaymentDate,
    safetyReserve: Number(form.safetyReserve || 0),
    plannedItems,
    extraItems: [],
    paidItemIds: [],
    todaySpent: 0,
    createdAt: new Date().toISOString(),
    status: 'active',
  })

  return <section className="avyo-card max-w-2xl p-6" aria-label="Assistente até receber">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Etapa {step + 1} de 5</p>
    <h2 className="mt-2 font-heading text-2xl font-bold">{steps[step][0]}</h2>
    <p className="mt-2 text-sm text-slate-400">{steps[step][1]}</p>

    {step === 0 && <label className="mt-6 block text-sm text-slate-300">Saldo disponível<input className={input} type="number" min="0" step="any" required value={form.balance} onChange={set('balance')} /></label>}

    {step === 1 && <label className="mt-6 block text-sm text-slate-300">Próximo recebimento<input className={input} type="date" required value={form.nextPaymentDate} onChange={set('nextPaymentDate')} /></label>}

    {step === 2 && <div className="mt-6 space-y-5">
      <div>
        <h3 className="font-heading font-semibold">Compromissos detectados</h3>
        {detectedItems.length ? <div className="mt-3 space-y-2">{detectedItems.map((item) => <label key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-sm"><span className="flex items-center gap-3"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id])} />{item.description}</span><strong>{formatCurrency(item.amount)}</strong></label>)}</div> : <p className="mt-2 text-sm text-slate-500">Nenhum compromisso recorrente foi detectado.</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Outro compromisso<input className={input} value={form.manualDescription} onChange={set('manualDescription')} placeholder="Ex.: mercado" /></label><label className="text-sm text-slate-300">Valor<input className={input} type="number" min="0" step="any" value={form.manualAmount} onChange={set('manualAmount')} /></label></div>
    </div>}

    {step === 3 && <label className="mt-6 block text-sm text-slate-300">Reserva de segurança<input className={input} type="number" min="0" step="any" value={form.safetyReserve} onChange={set('safetyReserve')} /></label>}

    {step === 4 && <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Saldo</p><strong className="mt-1 block font-heading text-xl">{formatCurrency(form.balance)}</strong></div><div className="rounded-2xl bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Comprometido</p><strong className="mt-1 block font-heading text-xl">{formatCurrency(committed)}</strong></div><div className="rounded-2xl bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Reserva</p><strong className="mt-1 block font-heading text-xl">{formatCurrency(form.safetyReserve)}</strong></div><div className="rounded-2xl bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Data</p><strong className="mt-1 block font-heading text-base">{form.nextPaymentDate}</strong></div></div>}

    <div className="mt-7 flex flex-wrap justify-between gap-3">
      <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Voltar</Button>
      {step < 4 ? <Button type="button" disabled={!canContinue} onClick={() => setStep((value) => Math.min(4, value + 1))}>Continuar</Button> : <Button type="button" onClick={finish}>Criar meu ritmo</Button>}
    </div>
  </section>
}
