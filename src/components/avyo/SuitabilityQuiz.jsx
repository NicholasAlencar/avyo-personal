import { useState } from 'react'
import { useFinanceStore } from '../../context/FinanceContext'
import { scoreSuitability } from '../../lib/investments'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const dimensions = [
  ['tolerance', 'Tolerância a oscilações', 'Quanto desconforto uma queda temporária causaria?'],
  ['capacity', 'Capacidade financeira', 'Quanto seu orçamento suporta manter o dinheiro investido?'],
  ['horizon', 'Horizonte de investimento', 'Por quanto tempo você pode manter o objetivo?'],
  ['liquidity', 'Necessidade de liquidez', 'Quanto você precisa acessar o dinheiro no curto prazo?'],
  ['knowledge', 'Conhecimento de investimentos', 'Quanto conhece produtos, riscos e oscilações?'],
]

const empty = { tolerance: 2, capacity: 2, horizon: 2, liquidity: 2, knowledge: 2, reasons: [], priorities: [] }

export function SuitabilityQuiz() {
  const { state, updateInvestmentProfile } = useFinanceStore()
  const previous = state.investmentProfile.answers || {}
  const [answers, setAnswers] = useState({ ...empty, ...previous, reasons: previous.reasons || [], priorities: previous.priorities || [] })

  const setDimension = (key) => (event) => setAnswers((current) => ({ ...current, [key]: Number(event.target.value) }))
  const toggleList = (key, value) => setAnswers((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))
  const submit = (event) => {
    event.preventDefault()
    const result = scoreSuitability(answers)
    updateInvestmentProfile({ ...result, answers: { ...answers } })
  }

  return <Card className="p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Encontre meu perfil</p><h2 className="mt-2 font-heading text-2xl font-bold">Seu perfil é {state.investmentProfile.profile}</h2></div><span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-400">Pode ser refeito quando quiser</span></div><p className="mt-3 max-w-2xl text-sm text-slate-400">Responda pensando na sua realidade atual. O resultado organiza conteúdo educativo e não é uma recomendação individual.</p>

    <form className="mt-6 space-y-5" onSubmit={submit}>{dimensions.map(([key, label, helper]) => <label key={key} className="block text-sm text-slate-300">{label}<span className="mt-1 block text-xs font-normal text-slate-500">{helper}</span><select aria-label={label} value={answers[key]} onChange={setDimension(key)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none focus:border-cyan-400/50"><option value="1">1 · Muito baixo</option><option value="2">2 · Moderado</option><option value="3">3 · Alto</option><option value="4">4 · Muito alto</option></select></label>)}

      <fieldset><legend className="text-sm text-slate-300">Por que você investe?</legend><div className="mt-3 flex flex-wrap gap-3">{[['aposentadoria', 'Aposentadoria'], ['reserva', 'Construção de reserva'], ['objetivos', 'Objetivos de médio prazo']].map(([value, label]) => <label key={value} className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-sm text-slate-300"><input type="checkbox" checked={answers.reasons.includes(value)} onChange={() => toggleList('reasons', value)} />{label}</label>)}</div></fieldset>
      <fieldset><legend className="text-sm text-slate-300">O que é mais importante?</legend><div className="mt-3 flex flex-wrap gap-3">{[['segurança', 'Segurança'], ['liquidez', 'Liquidez'], ['crescimento', 'Crescimento']].map(([value, label]) => <label key={value} className="flex items-center gap-2 rounded-xl border border-white/[0.07] px-3 py-2 text-sm text-slate-300"><input type="checkbox" checked={answers.priorities.includes(value)} onChange={() => toggleList('priorities', value)} />{label}</label>)}</div></fieldset>

      <div className="flex flex-wrap gap-3"><Button type="submit">Calcular meu perfil</Button><Button type="button" variant="ghost" onClick={() => setAnswers(empty)}>Refazer teste</Button></div>
    </form>
    <p className="mt-5 text-xs text-slate-500">Conteúdo educativo. O AVYO não promete retorno nem substitui avaliação profissional de suitability quando aplicável.</p>
  </Card>
}
