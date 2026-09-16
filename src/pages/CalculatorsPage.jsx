import { useState } from 'react'
import { formatCurrency } from '../lib/format'
import { projectWealth } from '../lib/projections'
import { Button } from '../components/ui/Button'
import { CalculatorCard } from '../components/avyo/CalculatorCard'
import { PageHeader } from '../components/avyo/PageHeader'
import { learningNav, RouteNav } from '../components/avyo/RouteNav'

const input = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

const calculators = [
  { title: 'Aporte para uma meta', description: 'Quanto guardar por mês.', kind: 'divide', aLabel: 'Valor da meta', bLabel: 'Meses', explanation: 'Dividimos o valor pelo prazo para criar uma referência mensal simples.' },
  { title: 'Juros compostos', description: 'Como o tempo afeta um valor.', kind: 'compound', aLabel: 'Valor inicial', bLabel: 'Meses', explanation: 'Projetamos uma taxa anual hipotética de 10% apenas para fins educativos.' },
  { title: 'Reserva de emergência', description: 'Quanto guardar por mês para formar a proteção.', kind: 'divide', aLabel: 'Meta da reserva', bLabel: 'Meses para formar', explanation: 'Dividimos a proteção desejada pelo tempo disponível, sem considerar rendimentos.' },
  { title: 'Gasto disponível', description: 'Distribua uma margem entre os dias.', kind: 'divide', aLabel: 'Margem disponível', bLabel: 'Dias restantes', explanation: 'Dividimos a margem pelos dias informados para criar um ritmo de referência.' },
  { title: 'Poupança mensal', description: 'Converta uma meta anual em hábito.', kind: 'divide', aLabel: 'Meta anual', bLabel: 'Meses', explanation: 'Transformamos a meta total em uma referência mensal uniforme.' },
]

function SimpleCalc({ config }) {
  const [draft, setDraft] = useState({ a: 1000, b: 12 })
  const [result, setResult] = useState(() => calculate(config.kind, 1000, 12))

  function run() {
    setResult(calculate(config.kind, draft.a, draft.b))
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-slate-400">{config.aLabel}<input aria-label={config.aLabel} className={input} type="number" min="0" step="any" value={draft.a} onChange={(event) => setDraft((value) => ({ ...value, a: Number(event.target.value || 0) }))} /></label>
        <label className="text-xs text-slate-400">{config.bLabel}<input aria-label={config.bLabel} className={input} type="number" min="1" step="1" value={draft.b} onChange={(event) => setDraft((value) => ({ ...value, b: Number(event.target.value || 0) }))} /></label>
      </div>
      <Button type="button" variant="secondary" className="mt-4" onClick={run} aria-label={`Calcular ${config.title.toLowerCase()}`}>Calcular</Button>
      <p className="mt-4 text-sm text-slate-400">Resultado <strong data-result className="ml-1 text-cyan-200">{formatCurrency(result)}</strong></p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{config.explanation}</p>
    </>
  )
}

function calculate(kind, a, b) {
  if (kind === 'compound') return projectWealth({ initial: Number(a || 0), monthlyContribution: 0, annualRate: .10, months: Math.max(1, Number(b || 1)) }).at(-1).balance
  return Number(a || 0) / Math.max(1, Number(b || 1))
}

export function CalculatorsPage() {
  return (
    <>
      <RouteNav items={learningNav} />
      <PageHeader eyebrow="Aprender" title="Calculadoras" subtitle="Teste cenários e transforme objetivos distantes em números de hoje." />
      <div className="grid gap-4 md:grid-cols-2">
        {calculators.map((config) => <CalculatorCard key={config.title} title={config.title} description={config.description}><SimpleCalc config={config} /></CalculatorCard>)}
      </div>
      <p className="mt-5 text-xs text-slate-500">As calculadoras são educativas, rodam somente no navegador e não representam garantia de resultado ou recomendação financeira.</p>
    </>
  )
}
