import { useMemo, useState } from 'react'
import { compareWealthScenarios, projectWealth } from '../lib/projections'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { WealthProjectionChart } from '../components/avyo/WealthProjectionChart'

const initialForm = { initial: 10000, monthly: 1000, rate: 10, period: 10, unit: 'years', extra: 0, extraMonth: 1 }

export function WealthCalculatorPage() {
  const [form, setForm] = useState(initialForm)
  const [calculation, setCalculation] = useState(initialForm)
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.type === 'number' ? Number(event.target.value) : event.target.value }))
  const months = calculation.unit === 'years' ? Number(calculation.period || 0) * 12 : Number(calculation.period || 0)
  const extras = Number(calculation.extra || 0) > 0 ? [{ month: Math.max(1, Number(calculation.extraMonth || 1)), amount: Number(calculation.extra) }] : []
  const points = useMemo(() => projectWealth({ initial: calculation.initial, monthlyContribution: calculation.monthly, annualRate: calculation.rate / 100, months, extraContributions: extras }), [calculation, months])
  const comparisons = useMemo(() => compareWealthScenarios({ initial: calculation.initial, monthlyContribution: calculation.monthly, months, extraContributions: extras }), [calculation.initial, calculation.monthly, months, calculation.extra, calculation.extraMonth])

  return <><PageHeader eyebrow="Patrimônio" title="Calculadora de futuro" subtitle="Explore cenários sem confundir projeção com promessa." /><Card className="p-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm text-slate-300">Valor inicial<input aria-label="Valor inicial" type="number" min="0" step="any" value={form.initial} onChange={set('initial')} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3" /></label><label className="text-sm text-slate-300">Aporte mensal<input aria-label="Aporte mensal" type="number" min="0" step="any" value={form.monthly} onChange={set('monthly')} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3" /></label><label className="text-sm text-slate-300">Taxa anual (%)<input aria-label="Taxa anual (%)" type="number" min="0" step="any" value={form.rate} onChange={set('rate')} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3" /></label><div className="grid grid-cols-[1fr_auto] gap-2"><label className="text-sm text-slate-300">Período<input aria-label="Período" type="number" min="1" value={form.period} onChange={set('period')} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3" /></label><label className="text-sm text-slate-300">Unidade<select aria-label="Unidade do período" value={form.unit} onChange={set('unit')} className="mt-2 min-h-11 rounded-xl border border-white/10 bg-slate-950 px-3"><option value="years">Anos</option><option value="months">Meses</option></select></label></div><label className="text-sm text-slate-300">Aporte extra<input aria-label="Aporte extra" type="number" min="0" step="any" value={form.extra} onChange={set('extra')} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3" /></label><label className="text-sm text-slate-300">Mês do aporte extra<input aria-label="Mês do aporte extra" type="number" min="1" value={form.extraMonth} onChange={set('extraMonth')} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3" /></label></div><Button className="mt-6" onClick={() => setCalculation({ ...form })}>Calcular</Button>

      <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-400/10 p-6 text-center"><p className="text-sm text-slate-400">Patrimônio futuro estimado</p><strong aria-label="Patrimônio futuro estimado" className="mt-2 block font-heading text-4xl text-gradient">{formatCurrency(points.at(-1)?.balance || calculation.initial)}</strong><p className="mt-3 text-xs text-slate-500">Projeção não é promessa de retorno. Valores são cenários matemáticos.</p></div><WealthProjectionChart points={points} />
    </Card>

    <div className="mt-5 grid gap-4 md:grid-cols-3">{comparisons.map((scenario) => <Card key={scenario.label} className="p-5"><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500">Cenário {Math.round(scenario.rate * 100)}%</p><h2 className="mt-2 font-heading text-lg font-semibold">{scenario.label}</h2><strong className="mt-3 block text-xl text-cyan-200">{formatCurrency(scenario.final)}</strong><p className="mt-2 text-xs text-slate-500">Taxa anual hipotética para comparação educativa.</p></Card>)}</div>
  </>
}
