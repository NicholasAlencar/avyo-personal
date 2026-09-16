import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { buildInsights } from '../lib/insights'
import { monthKey } from '../lib/format'
import { AiDisclosure } from '../components/avyo/AiDisclosure'
import { PlannerChat } from '../components/avyo/PlannerChat'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'

export function PlannerPage() {
  const { state, updateSettings } = useFinanceStore()
  const [aiOpen, setAiOpen] = useState(false)
  const items = useMemo(() => buildInsights(aggregateFinance(state, monthKey()), state), [state])
  const groups = [{ title: 'Agora', icon: Sparkles, items: items.filter((item) => item.priority >= 80) }, { title: 'Neste mês', icon: Clock3, items: items.filter((item) => item.priority >= 50 && item.priority < 80) }, { title: 'Depois', icon: CheckCircle2, items: items.filter((item) => item.priority < 50) }]
  const aiAccepted = state.settings.aiEnabled && state.settings.aiDisclosureAccepted

  return <><PageHeader eyebrow="Orientação personalizada" title="Seu plano de ação" subtitle="Uma ordem simples para você não precisar resolver tudo ao mesmo tempo." /><div className="grid gap-4 lg:grid-cols-3">{groups.map(({ title, icon: Icon, items: group }) => <Card key={title} className="p-5"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Icon size={17} /></div><h2 className="font-heading text-lg font-semibold">{title}</h2></div><div className="mt-5 space-y-3">{group.length ? group.map((item) => <Link key={item.id} to={item.to || '/'} className="group block rounded-xl bg-white/[0.035] p-4 hover:bg-white/[0.06]"><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p><span className="mt-3 flex items-center gap-1 text-xs text-cyan-300">Agir agora <ArrowRight size={13} /></span></Link>) : <p className="text-sm text-slate-500">Nenhuma urgência aqui. Continue no seu ritmo.</p>}</div></Card>)}</div>

    <Card className="mt-5 overflow-hidden border-violet-400/15 p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-violet-300"><Sparkles size={17} /><span className="text-xs font-semibold uppercase tracking-[.15em]">Opcional</span></div><h2 className="mt-2 font-heading text-xl font-bold">Converse com o Planejador</h2><p className="mt-2 max-w-2xl text-sm text-slate-400">O plano acima funciona totalmente local. A IA só entra quando você ativa este recurso e aceita o envio de um resumo sanitizado.</p></div>{!aiOpen && <Button onClick={() => setAiOpen(true)}>Ativar Planejador com IA</Button>}</div></Card>

    {aiOpen && <div className="mt-4">{aiAccepted ? <PlannerChat state={state} /> : <AiDisclosure accepted={false} onAccept={() => updateSettings({ aiDisclosureAccepted: true, aiEnabled: true })} />}</div>}
  </>
}
