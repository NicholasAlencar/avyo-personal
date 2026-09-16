import { useState } from 'react'
import { useFinanceStore } from '../../context/FinanceContext'
import { scoreSuitability } from '../../lib/investments'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const questions = [
  ['tolerance', 'Tolerância a oscilações', 'Como você reage a quedas temporárias?'],
  ['capacity', 'Capacidade financeira', 'Quanto espaço seu orçamento tem para investir sem comprometer necessidades?'],
  ['horizon', 'Horizonte de investimento', 'Por quanto tempo você pode manter o dinheiro investido?'],
  ['liquidity', 'Necessidade de liquidez', 'Quanto você consegue deixar reservado sem precisar resgatar?'],
  ['knowledge', 'Conhecimento sobre investimentos', 'Quanto você já conhece produtos e riscos?'],
]

const options = [
  { value: '1', label: 'Baixo / preciso de mais proteção' },
  { value: '2', label: 'Moderado' },
  { value: '3', label: 'Bom espaço para variação' },
  { value: '4', label: 'Alto / aceito mais oscilação' },
]

export function SuitabilityQuiz() {
  const { state, updateInvestmentProfile } = useFinanceStore()
  const current = state.investmentProfile || {}
  const [answers, setAnswers] = useState(() => ({
    tolerance: String(current.tolerance || 2),
    capacity: String(current.capacity || 2),
    horizon: String(current.horizon || 2),
    liquidity: String(current.liquidity || 2),
    knowledge: String(current.knowledge || 2),
    reasons: current.reasons || [],
    priorities: current.priorities || [],
  }))
  const [result, setResult] = useState(current.updatedAt ? current : null)

  const toggleList = (key, value) => {
    setAnswers((before) => ({
      ...before,
      [key]: before[key].includes(value) ? before[key].filter((item) => item !== value) : [...before[key], value],
    }))
  }

  const calculate = () => {
    const scored = scoreSuitability({
      ...answers,
      tolerance: Number(answers.tolerance),
      capacity: Number(answers.capacity),
      horizon: Number(answers.horizon),
      liquidity: Number(answers.liquidity),
      knowledge: Number(answers.knowledge),
    })
    updateInvestmentProfile({
      ...scored,
      answers: { ...(current.answers || {}), ...scored },
    })
    setResult(scored)
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Encontre meu perfil</p>
        <h2 className="mt-2 font-heading text-2xl font-bold">Seu contexto vem antes do produto</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Responda cinco dimensões. O resultado é educativo e serve para organizar preferências, não para indicar um investimento específico.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {questions.map(([key, label, help]) => (
            <label key={key} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-slate-300">
              <span className="font-medium text-slate-200">{label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">{help}</span>
              <select
                aria-label={label}
                value={answers[key]}
                onChange={(event) => setAnswers((before) => ({ ...before, [key]: event.target.value }))}
                className="mt-3 min-h-11 w-full rounded-xl border border-white/10 bg-[#0c1426] px-3 text-white outline-none focus:border-cyan-400/50"
              >
                {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <fieldset className="rounded-2xl border border-white/[0.07] p-4">
            <legend className="px-1 text-sm font-medium">Por que você investe?</legend>
            {['reserva futura', 'aposentadoria', 'objetivos', 'patrimônio'].map((reason) => (
              <label key={reason} className="mt-2 flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={answers.reasons.includes(reason)} onChange={() => toggleList('reasons', reason)} />{reason}</label>
            ))}
          </fieldset>
          <fieldset className="rounded-2xl border border-white/[0.07] p-4">
            <legend className="px-1 text-sm font-medium">O que pesa mais?</legend>
            {['segurança', 'liquidez', 'crescimento', 'diversificação'].map((priority) => (
              <label key={priority} className="mt-2 flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={answers.priorities.includes(priority)} onChange={() => toggleList('priorities', priority)} />{priority}</label>
            ))}
          </fieldset>
        </div>

        <Button type="button" className="mt-6" onClick={calculate}>Calcular meu perfil</Button>
      </Card>

      {result && (
        <Card className="p-6">
          <p className="text-sm text-slate-400">Resultado atual</p>
          <h3 className="mt-2 font-heading text-2xl font-bold">Seu perfil é {result.profile}</h3>
          <p className="mt-2 text-sm text-slate-400">Você pode refazer este teste sempre que sua renda, objetivos, prazo ou tolerância a oscilações mudar.</p>
        </Card>
      )}
    </div>
  )
}
