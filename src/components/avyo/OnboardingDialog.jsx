import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkles, WalletCards } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFinanceStore } from '../../context/FinanceContext'
import { formatCurrency } from '../../lib/format'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20'

const stageMeta = [
  { title: 'Boas-vindas ao AVYO', icon: Sparkles },
  { title: 'Organizar sem complicar', icon: WalletCards },
  { title: 'Construa sua proteção', icon: ShieldCheck },
]

export function OnboardingDialog() {
  const { state, updateProfile } = useFinanceStore()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    essentialCost: state.profile.essentialCost || '',
    monthsGoal: state.profile.monthsGoal || 6,
    reserveAmount: state.profile.reserveAmount || '',
  })
  const titleRef = useRef(null)

  useEffect(() => { titleRef.current?.focus() }, [step])
  if (state.profile.onboarded) return null

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const target = Math.max(0, Number(form.essentialCost) || 0) * Math.max(0, Number(form.monthsGoal) || 0)
  const { title, icon: Icon } = stageMeta[step]

  const finish = (profilePatch = {}) => {
    updateProfile({ ...profilePatch, onboarded: true })
    navigate('/movimentacoes/transacoes', { replace: true })
  }

  const complete = () => finish({
    essentialCost: Number(form.essentialCost) || 0,
    monthsGoal: Number(form.monthsGoal) || 6,
    reserveAmount: Number(form.reserveAmount) || 0,
  })

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: 'easeOut' }

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#050914]/90 p-4 backdrop-blur-md">
    <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="avyo-card my-4 w-full max-w-xl overflow-hidden p-6 sm:p-8">
      <div className="mb-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Icon size={22} /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Passo {step + 1} de 3</p>
            <h2 id="onboarding-title" ref={titleRef} tabIndex="-1" className="font-heading text-2xl font-bold outline-none">{title}</h2>
          </div>
        </div>
        <Progress value={(step + 1) / 3 * 100} label="Progresso do onboarding" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={step}
          initial={reducedMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -18 }}
          transition={transition}
        >
          {step === 0 && <div className="space-y-5">
            <div>
              <h3 className="font-heading text-xl font-semibold">Seu dinheiro com contexto, sem começar por um formulário</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">O AVYO ajuda a organizar movimentações, compromissos, proteção, metas e patrimônio. Você pode começar agora e completar seus dados aos poucos.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['1', 'Organize', 'Veja o que entra, sai e fica comprometido.'],
                ['2', 'Proteja', 'Crie uma referência de reserva para imprevistos.'],
                ['3', 'Construa', 'Acompanhe metas, investimentos e patrimônio.'],
              ].map(([number, label, text]) => <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <span className="text-xs font-semibold text-cyan-300">{number}</span>
                <strong className="mt-2 block text-sm text-white">{label}</strong>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
              </div>)}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">Nada desta etapa exige nome, renda ou conexão bancária.</p>
          </div>}

          {step === 1 && <div className="space-y-5">
            <div>
              <h3 className="font-heading text-xl font-semibold">Organizar vem antes de otimizar</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Comece por Transações. Depois o AVYO conecta orçamento, compromissos, reserva, metas e investimentos sem pedir que você configure tudo de uma vez.</p>
            </div>
            <div className="space-y-3">
              {[
                ['Movimentações', 'Registre ou importe o que realmente aconteceu.'],
                ['Planejamento', 'Defina limites e acompanhe o período até receber.'],
                ['Patrimônio', 'Consolide proteção, investimentos, bens e dívidas.'],
              ].map(([label, text]) => <div key={label} className="flex gap-3 rounded-xl bg-white/[0.035] p-4">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-cyan-300" />
                <div><strong className="text-sm text-white">{label}</strong><p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p></div>
              </div>)}
            </div>
          </div>}

          {step === 2 && <div className="space-y-5">
            <div>
              <h3 className="font-heading text-xl font-semibold">Uma referência simples para sua proteção</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Informe apenas o que fizer sentido agora. Esses valores ficam no navegador e podem ser alterados depois.</p>
            </div>
            <label className="block text-sm text-slate-300">Custo essencial mensal<input className={inputClass} type="number" min="0" step="any" value={form.essentialCost} onChange={set('essentialCost')} placeholder="0,00" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-300">Meses de proteção<select className={inputClass} value={form.monthsGoal} onChange={set('monthsGoal')}><option value="3">3 meses</option><option value="6">6 meses</option><option value="9">9 meses</option><option value="12">12 meses</option></select></label>
              <label className="block text-sm text-slate-300">Reserva atual<input className={inputClass} type="number" min="0" step="any" value={form.reserveAmount} onChange={set('reserveAmount')} placeholder="0,00" /></label>
            </div>
            <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Meta estimada de proteção</p>
              <strong className="mt-2 block font-heading text-2xl text-white">{formatCurrency(target)}</strong>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">Custo essencial × {Number(form.monthsGoal) || 0} meses. É uma referência educativa, não uma obrigação.</p>
            </div>
          </div>}
        </motion.section>
      </AnimatePresence>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => finish()}>Pular e configurar depois</Button>
        {step > 0 && <Button variant="secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={17} />Voltar</Button>}
        <Button className="ml-auto" onClick={step === 2 ? complete : () => setStep((current) => current + 1)}>
          {step === 2 ? <><Check size={17} />Começar</> : <>Continuar<ArrowRight size={17} /></>}
        </Button>
      </div>
    </div>
  </div>
}
