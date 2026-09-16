import { useMemo, useState } from 'react'
import { useFinanceStore } from '../../context/FinanceContext'
import { compareAllocation, normalizeAllocation, portfolioAllocation, profileAllocation } from '../../lib/investments'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Progress } from '../ui/Progress'

const categories = [
  ['stable', 'Renda fixa'],
  ['variable', 'Renda variável'],
  ['international', 'Internacional'],
  ['realAssets', 'FIIs e ativos reais'],
]

export function AllocationEditor() {
  const { state, updateInvestmentProfile } = useFinanceStore()
  const saved = state.investmentProfile?.answers?.allocation
  const defaults = saved || profileAllocation(state.investmentProfile?.profile)
  const [allocation, setAllocation] = useState(defaults)
  const [error, setError] = useState('')
  const [savedNotice, setSavedNotice] = useState(false)
  const current = useMemo(() => portfolioAllocation(state.investments), [state.investments])
  const difference = useMemo(() => compareAllocation(current, allocation), [current, allocation])
  const total = Object.values(allocation).reduce((sum, value) => sum + Number(value || 0), 0)

  const save = () => {
    try {
      const normalized = normalizeAllocation(allocation)
      updateInvestmentProfile({
        answers: { ...(state.investmentProfile?.answers || {}), allocation: normalized },
      })
      setAllocation(normalized)
      setError('')
      setSavedNotice(true)
    } catch (cause) {
      if (cause?.message === 'allocation_total') setError(`A distribuição precisa somar exatamente 100%. Agora soma ${total}%.`)
      else setError('Não foi possível salvar esta distribuição.')
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Distribuição desejada</p>
            <h2 className="mt-2 font-heading text-xl font-semibold">Monte seu alvo em percentuais</h2>
          </div>
          <strong className={total === 100 ? 'text-emerald-300' : 'text-amber-300'}>{total}%</strong>
        </div>

        <div className="mt-6 space-y-4">
          {categories.map(([key, label]) => (
            <label key={key} className="block text-sm text-slate-300">{label}
              <div className="mt-2 flex items-center gap-3">
                <input
                  aria-label={label}
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={allocation[key] ?? 0}
                  onChange={(event) => { setAllocation((before) => ({ ...before, [key]: Number(event.target.value || 0) })); setSavedNotice(false) }}
                  className="min-h-11 w-28 rounded-xl border border-white/10 bg-[#0c1426] px-3 text-white outline-none focus:border-cyan-400/50"
                />
                <div className="flex-1"><Progress value={Number(allocation[key] || 0)} tone="violet" label={`Meta em ${label}`} /></div>
              </div>
            </label>
          ))}
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        {savedNotice && <p role="status" className="mt-4 text-sm text-emerald-300">Distribuição salva neste dispositivo.</p>}
        <Button type="button" className="mt-5" onClick={save}>Salvar distribuição</Button>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">Percentuais são uma ferramenta de organização. Esta tela é educativa e não constitui recomendação individual de investimento.</p>
      </Card>

      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Carteira x alvo</p>
        <h2 className="mt-2 font-heading text-xl font-semibold">Onde existe diferença</h2>
        <div className="mt-5 space-y-3">
          {categories.map(([key, label]) => {
            const delta = Number(difference[key] || 0)
            return (
              <div key={key} className="rounded-xl bg-white/[0.035] p-4">
                <div className="flex justify-between gap-4 text-sm"><span>{label}</span><strong>{delta > 0 ? '+' : ''}{delta.toFixed(1)} p.p.</strong></div>
                <p className="mt-1 text-xs text-slate-500">Atual {Number(current[key] || 0).toFixed(1)}% · alvo {Number(allocation[key] || 0).toFixed(1)}%</p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
