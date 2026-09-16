import { useState } from 'react'
import { formatCurrency } from '../../lib/format'
import { profileAllocation } from '../../lib/investments'

const labels = {
  stable: 'Renda fixa',
  variable: 'Renda variável',
  international: 'Internacional',
  realAssets: 'FIIs e ativos reais',
}

export function NextContribution({ profile, allocation }) {
  const [value, setValue] = useState(1000)
  const target = allocation || profileAllocation(profile)

  return (
    <div className="avyo-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Próximo aporte</p>
      <h2 className="mt-2 font-heading text-xl font-semibold">Veja uma divisão proporcional ao seu alvo</h2>
      <p className="mt-2 text-sm text-slate-400">Isto não escolhe ativos por você. Apenas transforma os percentuais que você definiu em valores para facilitar o planejamento.</p>

      <label className="mt-5 block text-sm text-slate-300">Quanto você pretende aportar?
        <input type="number" min="0" step="any" value={value} onChange={(event) => setValue(Number(event.target.value || 0))} className="mt-2 min-h-11 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50" />
      </label>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(target).map(([key, percentage]) => (
          <div key={key} className="rounded-xl bg-white/[0.04] p-4">
            <p className="text-xs text-slate-500">{labels[key] || key} · {percentage}%</p>
            <strong className="mt-2 block">{formatCurrency(value * Number(percentage || 0) / 100)}</strong>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-500">Exemplo educativo. Antes de investir, considere liquidez, custos, impostos, objetivos, reserva de emergência e sua própria tolerância a risco.</p>
    </div>
  )
}
