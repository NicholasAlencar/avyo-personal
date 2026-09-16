import { useState } from 'react'
import { formatCurrency } from '../lib/format'
import { projectWealth } from '../lib/projections'
import { Button } from '../components/ui/Button'
import { CalculatorCard } from '../components/avyo/CalculatorCard'
import { PageHeader } from '../components/avyo/PageHeader'
import { learningNav, RouteNav } from '../components/avyo/RouteNav'

const input = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3'

function SimpleCalc({ kind, title }) {
  const [a, setA] = useState(1000)
  const [b, setB] = useState(12)
  const [result, setResult] = useState(null)
  const calculate = () => {
    let value = Number(a || 0) / Math.max(1, Number(b || 1))
    if (kind === 'compound') value = projectWealth({ initial: Number(a || 0), monthlyContribution: 0, annualRate: .10, months: Math.max(1, Number(b || 1)) }).at(-1)?.balance || 0
    if (kind === 'reserve') value = Number(a || 0) * Math.max(1, Number(b || 1))
    setResult(value)
  }
  return <div role="region" aria-label={`Calculadora ${title}`}><div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-400">Valor<input className={input} type="number" step="any" value={a} onChange={(event) => setA(Number(event.target.value))} /></label><label className="text-xs text-slate-400">{kind === 'reserve' ? 'Meses de proteção' : 'Meses'}<input className={input} type="number" min="1" value={b} onChange={(event) => setB(Number(event.target.value))} /></label></div><Button className="mt-4" variant="secondary" onClick={calculate}>Calcular</Button>{result !== null && <p className="mt-4 text-sm text-slate-400">Resultado <strong className="ml-1 text-cyan-200">{formatCurrency(result)}</strong></p>}</div>
}

const calculators = [
  ['Aporte para uma meta', 'Quanto guardar por mês.', 'divide'],
  ['Juros compostos', 'Como o tempo afeta um valor em um cenário hipotético de 10% ao ano.', 'compound'],
  ['Reserva de emergência', 'Multiplique seu custo essencial pelos meses de proteção.', 'reserve'],
  ['Gasto disponível', 'Distribua uma margem entre os dias.', 'divide'],
  ['Poupança mensal', 'Converta uma meta anual em hábito.', 'divide'],
]

export function CalculatorsPage() { return <><RouteNav items={learningNav} /><PageHeader eyebrow="Aprender" title="Calculadoras" subtitle="Teste cenários e transforme objetivos distantes em números de hoje." /><div className="grid gap-4 md:grid-cols-2">{calculators.map(([title, description, kind]) => <CalculatorCard key={title} title={title} description={description}><SimpleCalc kind={kind} title={title} /></CalculatorCard>)}</div><p className="mt-5 text-xs text-slate-500">Resultados são cálculos educativos e só são atualizados quando você pressiona Calcular.</p></> }
