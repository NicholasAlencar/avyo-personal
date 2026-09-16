import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFinanceStore } from '../../context/FinanceContext'
import { formatCurrency } from '../../lib/format'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20'

export function OnboardingDialog() {
  const { state, updateProfile } = useFinanceStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: state.profile.name || '', income: state.profile.income || '', essentialCost: state.profile.essentialCost || '',
    monthsGoal: state.profile.monthsGoal || 6, reserveAmount: state.profile.reserveAmount || '', payday: state.profile.payday || 5,
    hasBusiness: Boolean(state.profile.hasBusiness), proLabore: state.profile.proLabore || '', profitDistribution: state.profile.profitDistribution || '',
  })
  const titleRef = useRef(null)
  useEffect(() => { titleRef.current?.focus() }, [step])
  if (state.profile.onboarded) return null

  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const essential = Number(form.essentialCost || 0)
  const reserve = Number(form.reserveAmount || 0)
  const monthsGoal = Number(form.monthsGoal || 6)
  const target = essential * monthsGoal
  const covered = essential > 0 ? reserve / essential : 0

  const finish = () => {
    updateProfile({
      ...form,
      income: Number(form.income || 0), essentialCost: essential, monthsGoal, reserveAmount: reserve,
      payday: Number(form.payday || 5), proLabore: Number(form.proLabore || 0), profitDistribution: Number(form.profitDistribution || 0), onboarded: true,
    })
    navigate('/movimentacoes/transacoes', { replace: true })
  }
  const skip = () => {
    updateProfile({ onboarded: true })
    navigate('/movimentacoes/transacoes', { replace: true })
  }

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#050914]/90 p-4 backdrop-blur-md"><div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="avyo-card my-4 w-full max-w-xl overflow-hidden p-6 sm:p-8">
    <div className="mb-7"><div className="mb-5 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Sparkles size={22} /></div><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Passo {step + 1} de 3</p><h2 id="onboarding-title" ref={titleRef} tabIndex="-1" className="font-heading text-2xl font-bold outline-none">Bem-vindo ao AVYO</h2></div></div><Progress value={(step + 1) / 3 * 100} label="Progresso do onboarding" /></div>

    <AnimatePresence mode="wait" initial={false}><motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: .18 }}>
      {step === 0 && <div className="space-y-5"><div><h3 className="font-heading text-xl font-semibold">Comece pelo básico — ou configure depois</h3><p className="mt-1 text-sm text-slate-400">Nada aqui é obrigatório para entrar no app. Quanto mais contexto você der, melhores ficam os cálculos locais.</p></div><label className="block text-sm text-slate-300">Seu nome<input className={inputClass} value={form.name} onChange={set('name')} placeholder="Como prefere ser chamado?" /></label><label className="block text-sm text-slate-300">Renda mensal<input className={inputClass} type="number" min="0" step="any" value={form.income} onChange={set('income')} placeholder="0,00" /></label></div>}

      {step === 1 && <div className="space-y-5"><div><h3 className="font-heading text-xl font-semibold">Construa seu escudo</h3><p className="mt-1 text-sm text-slate-400">A proteção é calculada com custo essencial, reserva atual e quantidade desejada de meses.</p></div><label className="block text-sm text-slate-300">Custo essencial mensal<input className={inputClass} type="number" min="0" step="any" value={form.essentialCost} onChange={set('essentialCost')} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-slate-300">Meta de reserva<select className={inputClass} value={form.monthsGoal} onChange={set('monthsGoal')}><option value="3">3 meses</option><option value="6">6 meses</option><option value="9">9 meses</option><option value="12">12 meses</option></select></label><label className="block text-sm text-slate-300">Reserva atual<input className={inputClass} type="number" min="0" step="any" value={form.reserveAmount} onChange={set('reserveAmount')} /></label></div><div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4"><div className="flex items-center gap-2 text-cyan-300"><ShieldCheck size={17} /><span className="text-xs font-semibold uppercase tracking-[.14em]">Preview de proteção</span></div><strong className="mt-2 block font-heading text-2xl">{covered.toFixed(1)} meses protegidos</strong><p className="mt-1 text-sm text-slate-400">{formatCurrency(reserve)} de {formatCurrency(target)} para a meta escolhida.</p></div></div>}

      {step === 2 && <div className="space-y-5"><div><h3 className="font-heading text-xl font-semibold">Ajustes finais</h3><p className="mt-1 text-sm text-slate-400">Defina quando costuma receber e, se quiser, sinalize renda de negócio. Tudo pode ser alterado depois.</p></div><label className="block text-sm text-slate-300">Dia do recebimento<input className={inputClass} type="number" min="1" max="31" value={form.payday} onChange={set('payday')} /></label><label className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-slate-300"><input type="checkbox" checked={form.hasBusiness} onChange={set('hasBusiness')} className="size-4 accent-cyan-400" />Também tenho renda de negócio</label>{form.hasBusiness && <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Pró-labore<input className={inputClass} type="number" min="0" step="any" value={form.proLabore} onChange={set('proLabore')} /></label><label className="text-sm text-slate-300">Distribuição de lucros<input className={inputClass} type="number" min="0" step="any" value={form.profitDistribution} onChange={set('profitDistribution')} /></label></div>}</div>}
    </motion.div></AnimatePresence>

    <div className="mt-8 flex flex-wrap gap-3"><Button variant="ghost" onClick={skip}>Pular por agora</Button>{step > 0 && <Button variant="secondary" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={17} />Voltar</Button>}<Button className="ml-auto" onClick={step === 2 ? finish : () => setStep((value) => value + 1)}>{step === 2 ? <><Check size={17} />Concluir</> : <>Continuar<ArrowRight size={17} /></>}</Button></div>
  </div></div>
}
