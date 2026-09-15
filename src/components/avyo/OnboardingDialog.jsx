import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useFinanceStore } from '../../context/FinanceContext'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20'

export function OnboardingDialog() {
  const { state, updateProfile } = useFinanceStore()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: state.profile.name || '', income: state.profile.income || '', essentialCost: state.profile.essentialCost || '',
    monthsGoal: state.profile.monthsGoal || 6, reserveAmount: state.profile.reserveAmount || '', payday: state.profile.payday || 5,
    hasBusiness: Boolean(state.profile.hasBusiness), proLabore: state.profile.proLabore || '', profitDistribution: state.profile.profitDistribution || '',
  })
  const titleRef = useRef(null)
  useEffect(() => { titleRef.current?.focus() }, [step])
  if (state.profile.onboarded) return null

  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const next = () => {
    if (step === 0 && (!form.name.trim() || Number(form.income) <= 0)) return setError('Conte seu nome e uma renda maior que zero para continuar.')
    if (step === 1 && Number(form.essentialCost) <= 0) return setError('Informe quanto custa o seu mês essencial.')
    setError(''); setStep((value) => value + 1)
  }
  const finish = () => updateProfile({ ...form, income: Number(form.income), essentialCost: Number(form.essentialCost), monthsGoal: Number(form.monthsGoal), reserveAmount: Number(form.reserveAmount), payday: Number(form.payday), proLabore: Number(form.proLabore), profitDistribution: Number(form.profitDistribution), onboarded: true })

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#050914]/90 p-4 backdrop-blur-md"><div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="avyo-card my-4 w-full max-w-xl overflow-hidden p-6 sm:p-8">
    <div className="mb-7"><div className="mb-5 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Sparkles size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Passo {step + 1} de 3</p><h2 id="onboarding-title" ref={titleRef} tabIndex="-1" className="font-heading text-2xl font-bold outline-none">Bem-vindo ao AVYO</h2></div></div><Progress value={(step + 1) / 3 * 100} label="Progresso do onboarding" /></div>
    {step === 0 && <div className="space-y-5"><div><h3 className="font-heading text-xl font-semibold">Vamos começar pelo que entra</h3><p className="mt-1 text-sm text-slate-400">Isso nos ajuda a traduzir seus números em decisões possíveis.</p></div><label className="block text-sm text-slate-300">Seu nome<input autoFocus className={inputClass} value={form.name} onChange={set('name')} placeholder="Como prefere ser chamado?" /></label><label className="block text-sm text-slate-300">Renda mensal<input className={inputClass} type="number" min="0" value={form.income} onChange={set('income')} placeholder="0,00" /></label></div>}
    {step === 1 && <div className="space-y-5"><div><h3 className="font-heading text-xl font-semibold">Quanto custa o essencial?</h3><p className="mt-1 text-sm text-slate-400">Moradia, alimentação básica, transporte e saúde.</p></div><label className="block text-sm text-slate-300">Custo essencial mensal<input autoFocus className={inputClass} type="number" min="0" value={form.essentialCost} onChange={set('essentialCost')} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-slate-300">Meta de reserva<select className={inputClass} value={form.monthsGoal} onChange={set('monthsGoal')}><option value="3">3 meses</option><option value="6">6 meses</option><option value="9">9 meses</option><option value="12">12 meses</option></select></label><label className="block text-sm text-slate-300">Reserva atual<input className={inputClass} type="number" min="0" value={form.reserveAmount} onChange={set('reserveAmount')} /></label></div></div>}
    {step === 2 && <div className="space-y-5"><div><h3 className="font-heading text-xl font-semibold">Só mais um detalhe</h3><p className="mt-1 text-sm text-slate-400">Quando você costuma receber? Depois, tudo pode ser ajustado.</p></div><label className="block text-sm text-slate-300">Dia do recebimento<input autoFocus className={inputClass} type="number" min="1" max="31" value={form.payday} onChange={set('payday')} /></label><label className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-slate-300"><input type="checkbox" checked={form.hasBusiness} onChange={set('hasBusiness')} className="size-4 accent-cyan-400" />Também tenho renda de negócio</label>{form.hasBusiness && <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Pró-labore<input className={inputClass} type="number" value={form.proLabore} onChange={set('proLabore')} /></label><label className="text-sm text-slate-300">Distribuição de lucros<input className={inputClass} type="number" value={form.profitDistribution} onChange={set('profitDistribution')} /></label></div>}</div>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
    <div className="mt-8 flex gap-3">{step > 0 && <Button variant="secondary" onClick={() => { setError(''); setStep((value) => value - 1) }}><ArrowLeft size={17} />Voltar</Button>}<Button className="ml-auto" onClick={step === 2 ? finish : next}>{step === 2 ? <><Check size={17} />Concluir</> : <>Continuar<ArrowRight size={17} /></>}</Button></div>
  </div></div>
}
