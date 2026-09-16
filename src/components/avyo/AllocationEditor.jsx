import { useMemo, useState } from 'react'
import { useFinanceStore } from '../../context/FinanceContext'
import { compareAllocation, currentAllocation, normalizeAllocation, PROFILE_ALLOCATION } from '../../lib/investments'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const labels = { stable: 'Base estável', variable: 'Renda variável', international: 'Internacional', realEstate: 'Imobiliário' }

export function AllocationEditor() {
  const { state, updateInvestmentProfile } = useFinanceStore()
  const profileDefault = PROFILE_ALLOCATION[state.investmentProfile.profile] || PROFILE_ALLOCATION.equilibrado
  const persisted = state.investmentProfile.answers?.allocation
  const [allocation, setAllocation] = useState({ ...(persisted || profileDefault) })
  const [error, setError] = useState('')
  const current = useMemo(() => currentAllocation(state.investments), [state.investments])
  const comparison = useMemo(() => compareAllocation(current, allocation), [current, allocation])
  const total = Object.values(allocation).reduce((sum, value) => sum + Number(value || 0), 0)

  const set = (key) => (event) => setAllocation((value) => ({ ...value, [key]: Number(event.target.value || 0) }))
  const save = () => {
    try {
      const normalized = normalizeAllocation(allocation)
      updateInvestmentProfile({ answers: { ...(state.investmentProfile.answers || {}), allocation: normalized } })
      setError('')
    } catch {
      setError('A distribuição precisa somar 100%.')
    }
  }

  return <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]"><Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-cyan-300">Distribuição desejada</p><h2 className="mt-2 font-heading text-xl font-bold">Ajuste os percentuais</h2><p className="mt-2 text-sm text-slate-400">Use como mapa educativo. O total precisa fechar exatamente em 100%.</p><div className="mt-5 space-y-4">{Object.keys(labels).map((key) => <label key={key} className="block text-sm text-slate-300">{labels[key]} (%)<input aria-label={`${labels[key]} (%)`} type="number" min="0" max="100" step="1" value={allocation[key] ?? 0} onChange={set(key)} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50" /></label>)}</div><div className="mt-5 flex items-center justify-between rounded-xl bg-white/[0.035] px-4 py-3"><span className="text-sm text-slate-400">Total</span><strong className={total === 100 ? 'text-emerald-300' : 'text-amber-300'}>{total}%</strong></div>{error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}<Button className="mt-5 w-full" onClick={save}>Salvar distribuição</Button></Card>

    <Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">Carteira x objetivo</p><h2 className="mt-2 font-heading text-xl font-bold">Onde está a diferença</h2><div className="mt-5 space-y-3">{comparison.map((item) => <div key={item.category} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3"><span className="text-sm text-slate-300">{labels[item.category]}</span><span className="text-xs text-slate-500">{item.current.toFixed(1)}% → {Number(item.desired).toFixed(1)}%</span><strong className={item.difference > 0 ? 'text-cyan-300' : item.difference < 0 ? 'text-amber-300' : 'text-slate-500'}>{item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)} pp</strong></div>)}</div><p className="mt-5 text-xs text-slate-500">Diferenças servem para aprendizado e planejamento; não são ordem automática de compra ou venda.</p></Card></div>
}
