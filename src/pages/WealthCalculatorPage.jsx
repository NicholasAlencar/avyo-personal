import { useMemo, useState } from 'react'
import { projectVariableContributions } from '../lib/projections'
import { formatCurrency } from '../lib/format'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { WealthProjectionChart } from '../components/avyo/WealthProjectionChart'

const scenarios = [6, 10, 15]
const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

function parseSchedule(value) {
  return String(value || '')
    .split(/[,;\n]/)
    .map((item) => Number(item.trim().replace(',', '.')))
    .filter((item) => Number.isFinite(item) && item >= 0)
}

export function WealthCalculatorPage() {
  const [form, setForm] = useState({ initial: 10000, monthly: 1000, rate: 10, duration: 10, unit: 'years', variable: '' })
  const months = Math.max(1, Math.round(form.unit === 'years' ? Number(form.duration || 0) * 12 : Number(form.duration || 0)))
  const customContributions = useMemo(() => parseSchedule(form.variable), [form.variable])
  const contributions = useMemo(
    () => customContributions.length ? customContributions : Array(months).fill(Number(form.monthly || 0)),
    [customContributions, form.monthly, months],
  )
  const points = useMemo(() => projectVariableContributions({ initial: form.initial, annualRate: form.rate / 100, months, contributions }), [form.initial, form.rate, months, contributions])
  const setNumber = (key) => (event) => setForm((value) => ({ ...value, [key]: Number(event.target.value || 0) }))

  return (
    <>
      <PageHeader eyebrow="Patrimônio" title="Calculadora de futuro" subtitle="Explore cenários, aportes diferentes e horizontes sem confundir projeção com promessa." />

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="font-heading text-xl font-semibold">Premissas</h2><p className="mt-1 text-sm text-slate-500">Troque qualquer valor e a projeção é recalculada localmente.</p></div>
          <div className="flex gap-2" aria-label="Cenários anuais">
            {scenarios.map((value) => <button key={value} type="button" onClick={() => setForm((current) => ({ ...current, rate: value }))} className={`rounded-xl px-4 py-2 text-sm font-semibold ${form.rate === value ? 'bg-violet-400/15 text-violet-200' : 'bg-white/[0.04] text-slate-500'}`}>{value}%</button>)}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm text-slate-300">Valor inicial<input aria-label="Valor inicial" type="number" min="0" step="any" value={form.initial} onChange={setNumber('initial')} className={inputClass} /></label>
          <label className="text-sm text-slate-300">Aporte mensal padrão<input aria-label="Aporte mensal padrão" type="number" min="0" step="any" value={form.monthly} onChange={setNumber('monthly')} className={inputClass} /></label>
          <label className="text-sm text-slate-300">Taxa anual (%)<input aria-label="Taxa anual (%)" type="number" min="0" step="any" value={form.rate} onChange={setNumber('rate')} className={inputClass} /></label>
          <div>
            <div className="flex gap-2" aria-label="Unidade do período">
              <button type="button" aria-pressed={form.unit === 'years'} onClick={() => setForm((current) => ({ ...current, unit: 'years' }))} className={`min-h-10 flex-1 rounded-lg text-xs font-semibold ${form.unit === 'years' ? 'bg-cyan-400/10 text-cyan-200' : 'bg-white/[0.04] text-slate-500'}`}>Anos</button>
              <button type="button" aria-pressed={form.unit === 'months'} onClick={() => setForm((current) => ({ ...current, unit: 'months' }))} className={`min-h-10 flex-1 rounded-lg text-xs font-semibold ${form.unit === 'months' ? 'bg-cyan-400/10 text-cyan-200' : 'bg-white/[0.04] text-slate-500'}`}>Meses</button>
            </div>
            <label className="mt-2 block text-sm text-slate-300">{form.unit === 'years' ? 'Anos' : 'Meses'}<input aria-label={form.unit === 'years' ? 'Anos' : 'Meses'} type="number" min="1" step="1" value={form.duration} onChange={setNumber('duration')} className={inputClass} /></label>
          </div>
        </div>

        <label className="mt-5 block text-sm text-slate-300">Aportes variáveis
          <input aria-label="Aportes variáveis" type="text" value={form.variable} onChange={(event) => setForm((current) => ({ ...current, variable: event.target.value }))} placeholder="Ex.: 1000, 1200, 900, 1500" className={inputClass} />
          <span className="mt-2 block text-xs text-slate-500">Opcional. Informe valores mês a mês separados por vírgula; após o último, ele é repetido até o fim do período.</span>
        </label>
        {customContributions.length > 0 && <p className="mt-3 text-sm text-cyan-200">{customContributions.length} valores personalizados no cronograma.</p>}
      </Card>

      <Card className="mt-5 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm text-slate-500">Patrimônio futuro estimado</p><strong aria-label="Patrimônio futuro estimado" className="mt-2 block font-heading text-3xl text-gradient">{formatCurrency(points.at(-1).balance)}</strong></div>
          <div><p className="text-sm text-slate-500">Aportes no período</p><strong className="mt-2 block font-heading text-2xl">{formatCurrency(points.at(-1).contributed)}</strong></div>
          <div><p className="text-sm text-slate-500">Horizonte</p><strong className="mt-2 block font-heading text-2xl">{months} meses</strong></div>
        </div>
        <WealthProjectionChart points={points} />
        <p className="mt-3 text-xs leading-relaxed text-slate-500">Simulação educativa; retornos não são garantidos. Taxas são hipóteses matemáticas e não representam promessa, recomendação de produto ou previsão de mercado.</p>
      </Card>
    </>
  )
}
