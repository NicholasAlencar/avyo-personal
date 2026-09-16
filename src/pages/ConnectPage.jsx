import { useMemo, useState } from 'react'
import { Building2, Link2Off, Save, ShieldCheck } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { formatCurrency, monthKey } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'

const input = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

export function ConnectPage() {
  const { state, updateProfile } = useFinanceStore()
  const [form, setForm] = useState(() => ({
    proLabore: state.profile.proLabore || 0,
    profitDistribution: state.profile.profitDistribution || 0,
    businessPersonalExpenses: state.profile.businessPersonalExpenses || 0,
    businessNetWorth: state.profile.businessNetWorth || 0,
  }))
  const finance = useMemo(() => aggregateFinance(state, monthKey()), [state])
  const connected = state.profile.businessConnected === true
  const set = (key) => (event) => setForm((before) => ({ ...before, [key]: event.target.value }))

  const save = () => {
    updateProfile({
      hasBusiness: true,
      businessConnected: true,
      proLabore: Number(form.proLabore || 0),
      profitDistribution: Number(form.profitDistribution || 0),
      businessPersonalExpenses: Number(form.businessPersonalExpenses || 0),
      businessNetWorth: Number(form.businessNetWorth || 0),
    })
  }

  const consolidated = finance.netWorth + Number(state.profile.businessNetWorth || 0)

  return (
    <>
      <PageHeader eyebrow="AVYO Connect" title="Seus dados, no seu controle" subtitle="Conecte apenas os números da sua empresa que ajudam a enxergar PF e PJ em conjunto." />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><span className="inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">{connected ? 'Dados locais conectados' : 'Modo local ativo'}</span><h2 className="mt-4 font-heading text-xl font-semibold">Resumo da sua empresa</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">Preencha somente agregados. O AVYO não acessa conta bancária, contabilidade ou Open Finance nesta versão.</p></div>
            <ShieldCheck className="text-cyan-300" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Pró-labore mensal<input aria-label="Pró-labore mensal" className={input} type="number" min="0" step="any" value={form.proLabore} onChange={set('proLabore')} /></label>
            <label className="text-sm text-slate-300">Distribuição de lucros<input aria-label="Distribuição de lucros" className={input} type="number" min="0" step="any" value={form.profitDistribution} onChange={set('profitDistribution')} /></label>
            <label className="text-sm text-slate-300">Despesas pessoais pagas pela empresa<input aria-label="Despesas pessoais pagas pela empresa" className={input} type="number" min="0" step="any" value={form.businessPersonalExpenses} onChange={set('businessPersonalExpenses')} /></label>
            <label className="text-sm text-slate-300">Patrimônio líquido da empresa<input aria-label="Patrimônio líquido da empresa" className={input} type="number" min="0" step="any" value={form.businessNetWorth} onChange={set('businessNetWorth')} /></label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={save}><Save size={16} />{connected ? 'Salvar dados locais' : 'Conectar dados locais'}</Button>
            {connected && <Button type="button" variant="ghost" onClick={() => updateProfile({ businessConnected: false })}><Link2Off size={16} />Desconectar</Button>}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-slate-500">O conteúdo desta área não é enviado ao Base44. Se você usar o Planejador com IA, somente agregados previstos no contexto do Planejador podem ser enviados após consentimento.</p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">PF + PJ</p>
          <h2 className="mt-2 font-heading text-xl font-semibold">Visão consolidada local</h2>
          {connected ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Patrimônio PF</p><strong className="mt-1 block">{formatCurrency(finance.netWorth)}</strong></div>
              <div className="rounded-xl bg-white/[0.04] p-4"><p className="text-xs text-slate-500">Patrimônio líquido da empresa</p><strong className="mt-1 block">{formatCurrency(state.profile.businessNetWorth)}</strong></div>
              <div className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4"><p className="text-xs text-slate-500">PF + PJ</p><strong className="mt-1 block font-heading text-2xl text-cyan-200">{formatCurrency(consolidated)}</strong></div>
              <div className="rounded-xl bg-white/[0.025] p-4 text-sm text-slate-400"><Building2 size={16} className="mb-2 text-violet-300" />Fluxo informado: {formatCurrency(Number(state.profile.proLabore || 0) + Number(state.profile.profitDistribution || 0) - Number(state.profile.businessPersonalExpenses || 0))} por mês.</div>
            </div>
          ) : <p className="mt-6 rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-400">Conecte os agregados locais para visualizar PF + PJ. Os valores preenchidos são preservados ao desconectar para facilitar uma reconexão futura.</p>}
        </Card>
      </div>
    </>
  )
}
