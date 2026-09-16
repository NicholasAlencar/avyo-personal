import { useMemo, useState } from 'react'
import { Building2, FileSpreadsheet, ShieldCheck, Unplug } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

export function ConnectPage() {
  const { state, updateProfile } = useFinanceStore()
  const [form, setForm] = useState({
    proLabore: state.profile.proLabore || '',
    profitDistribution: state.profile.profitDistribution || '',
    businessPersonalExpenses: state.profile.businessPersonalExpenses || '',
    businessNetWorth: state.profile.businessNetWorth || '',
  })
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }))
  const investments = useMemo(() => state.investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0), [state.investments])
  const personalAssets = useMemo(() => state.assets.reduce((sum, item) => sum + Number(item.value || 0), 0) + investments, [state.assets, investments])
  const personalLiabilities = useMemo(() => state.liabilities.reduce((sum, item) => sum + Number(item.value || 0), 0), [state.liabilities])
  const personalNetWorth = personalAssets - personalLiabilities
  const businessNetWorth = Number(state.profile.businessNetWorth || 0)
  const consolidated = personalNetWorth + businessNetWorth

  const connect = () => updateProfile({
    hasBusiness: true,
    businessConnected: true,
    proLabore: Number(form.proLabore || 0),
    profitDistribution: Number(form.profitDistribution || 0),
    businessPersonalExpenses: Number(form.businessPersonalExpenses || 0),
    businessNetWorth: Number(form.businessNetWorth || 0),
  })

  return <><PageHeader eyebrow="AVYO Connect" title="Seus dados, no seu controle" subtitle="Consolide sua visão pessoal e empresarial sem conexão bancária automática e sem enviar seu financeiro para servidores." />
    <Card className="overflow-hidden p-7"><div className="grid gap-6 md:grid-cols-[1.3fr_1fr]"><div><span className="inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Modo local ativo</span><h2 className="mt-4 font-heading text-2xl font-bold">Privacidade por padrão</h2><p className="mt-3 leading-relaxed text-slate-400">O Connect desta versão não acessa banco, Open Finance ou sistema contábil. Você informa apenas os números que quer consolidar e eles ficam neste navegador.</p></div><div className="grid gap-3">{[[ShieldCheck, 'Nada sai do navegador'], [FileSpreadsheet, 'Importação de movimentações permanece local'], [Building2, 'PF e PJ consolidados por valores informados']].map(([Icon, text]) => <div key={text} className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 text-sm text-slate-300"><Icon size={18} className="text-cyan-300" />{text}</div>)}</div></div></Card>

    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.9fr]"><Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-cyan-300">Configuração empresarial</p><h2 className="mt-2 font-heading text-xl font-bold">O que cruza PF e PJ</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Pró-labore mensal<input aria-label="Pró-labore mensal" type="number" min="0" step="any" value={form.proLabore} onChange={set('proLabore')} className={inputClass} /></label><label className="text-sm text-slate-300">Distribuição de lucros mensal<input aria-label="Distribuição de lucros mensal" type="number" min="0" step="any" value={form.profitDistribution} onChange={set('profitDistribution')} className={inputClass} /></label><label className="text-sm text-slate-300">Despesas pessoais pagas pela empresa<input aria-label="Despesas pessoais pagas pela empresa" type="number" min="0" step="any" value={form.businessPersonalExpenses} onChange={set('businessPersonalExpenses')} className={inputClass} /></label><label className="text-sm text-slate-300">Patrimônio líquido da empresa<input aria-label="Patrimônio líquido da empresa" type="number" step="any" value={form.businessNetWorth} onChange={set('businessNetWorth')} className={inputClass} /></label></div>{state.profile.businessConnected ? <div className="mt-5 flex flex-wrap items-center gap-3"><span className="rounded-full bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300">Visão PF + PJ ativa</span><Button variant="ghost" onClick={() => updateProfile({ businessConnected: false })}><Unplug size={15} />Desconectar empresa</Button></div> : <><Button className="mt-5" onClick={connect}>Conectar visão empresarial</Button>{state.profile.hasBusiness && <p className="mt-3 text-xs text-slate-500">Os valores permanecem salvos localmente mesmo desconectados.</p>}</>}</Card>

      <Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-violet-300">Visão consolidada</p><h2 className="mt-2 font-heading text-xl font-bold">Patrimônio consolidado</h2>{state.profile.businessConnected ? <div className="mt-5 space-y-3"><div className="flex justify-between rounded-xl bg-white/[0.035] p-4 text-sm"><span className="text-slate-400">Pessoa física</span><strong>{formatCurrency(personalNetWorth)}</strong></div><div className="flex justify-between rounded-xl bg-white/[0.035] p-4 text-sm"><span className="text-slate-400">Empresa</span><strong>{formatCurrency(businessNetWorth)}</strong></div><div className="flex justify-between rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4"><span className="text-slate-300">PF + PJ</span><strong className="text-cyan-200">{formatCurrency(consolidated)}</strong></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[0.035] p-3"><p className="text-xs text-slate-500">Pró-labore</p><strong className="mt-1 block text-sm">{formatCurrency(state.profile.proLabore)}</strong></div><div className="rounded-xl bg-white/[0.035] p-3"><p className="text-xs text-slate-500">Lucros</p><strong className="mt-1 block text-sm">{formatCurrency(state.profile.profitDistribution)}</strong></div></div></div> : <p className="mt-5 text-sm leading-relaxed text-slate-500">Configure os números ao lado para ativar uma visão consolidada. Nenhuma integração externa é necessária.</p>}</Card></div>
  </>
}
