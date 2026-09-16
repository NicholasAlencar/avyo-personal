import { useMemo, useState } from 'react'
import { Printer, Sparkles } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { buildInsights } from '../lib/insights'
import { buildMonthlyReportPayload } from '../lib/aiPayloads'
import { buildMonthlyReport } from '../lib/report'
import { formatCurrency, monthKey } from '../lib/format'
import { useAi } from '../services/ai/AiContext'
import { localAiFallback } from '../services/ai/LocalAiFallback'
import { AiDisclosure } from '../components/avyo/AiDisclosure'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'

export function ReportPage() {
  const { state, updateSettings } = useFinanceStore()
  const provider = useAi()
  const [aiOpen, setAiOpen] = useState(false)
  const [aiReport, setAiReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const finance = useMemo(() => aggregateFinance(state, monthKey()), [state])
  const insights = useMemo(() => buildInsights(finance, state), [finance, state])
  const report = useMemo(() => buildMonthlyReport(finance, insights), [finance, insights])
  const aiAccepted = state.settings.aiEnabled && state.settings.aiDisclosureAccepted
  const categories = Object.entries(finance.spentByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const generateAi = async () => {
    setLoading(true)
    const payload = buildMonthlyReportPayload(finance, insights)
    try {
      const result = await provider.generateMonthlyReport(payload)
      setAiReport({ summary: result.summary, attention: result.attention || result.attentionPoints || [], nextSteps: result.nextSteps || [], mode: result.mode || 'ai' })
    } catch {
      const result = await localAiFallback.generateMonthlyReport(payload)
      setAiReport({ ...result, mode: 'local' })
    } finally {
      setLoading(false)
    }
  }

  return <><PageHeader eyebrow="Leitura mensal" title="Relatório do mês" subtitle="Totais, gráficos e análise-base são gerados localmente. A narrativa assistida é opcional." action={<Button variant="secondary" onClick={() => window.print()}><Printer size={17} />Imprimir</Button>} />
    <div className="grid gap-4 sm:grid-cols-3">{[['Entrou', finance.income, 'text-emerald-300'], ['Saiu', finance.expenses, 'text-rose-300'], ['Sobrou', finance.result, 'text-cyan-300']].map(([label, value, color]) => <Card key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><strong className={`mt-2 block font-heading text-2xl ${color}`}>{formatCurrency(value)}</strong></Card>)}</div>

    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.8fr]"><article className="space-y-4"><Card className="p-6"><h2 className="font-heading text-xl font-semibold">Resumo</h2><p className="mt-3 leading-relaxed text-slate-300">{report.summary}</p></Card><Card className="p-6"><h2 className="font-heading text-xl font-semibold">Pontos de atenção</h2><ul className="mt-4 space-y-3 text-sm text-slate-300">{report.attentionPoints.map((point) => <li key={point} className="rounded-xl bg-white/[0.03] p-3">{point}</li>)}</ul></Card><Card className="p-6"><h2 className="font-heading text-xl font-semibold">Próximos passos</h2><ol className="mt-4 space-y-3">{report.nextSteps.map((point, index) => <li key={point} className="flex gap-3 text-sm text-slate-300"><span className="grid size-6 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-xs text-cyan-300">{index + 1}</span>{point}</li>)}</ol></Card></article>

      <div className="space-y-4"><Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.15em] text-cyan-300">Despesas por categoria</p><div className="mt-5 space-y-3">{categories.length ? categories.map(([category, amount]) => <div key={category} className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.035] px-4 py-3 text-sm"><span className="text-slate-400">{category}</span><strong>{formatCurrency(amount)}</strong></div>) : <p className="text-sm text-slate-500">Sem despesas categorizadas neste mês.</p>}</div></Card><Card className="border-violet-400/15 p-6"><div className="flex items-center gap-2 text-violet-300"><Sparkles size={16} /><span className="text-xs font-semibold uppercase tracking-[.15em]">Narrativa opcional</span></div><h2 className="mt-2 font-heading text-xl font-bold">Leitura assistida do mês</h2><p className="mt-2 text-sm text-slate-400">O relatório local acima não depende de IA. Use este bloco somente se quiser uma segunda leitura baseada em dados resumidos.</p>{!aiOpen && <Button className="mt-5" onClick={() => setAiOpen(true)}>Gerar leitura com IA</Button>}{aiOpen && !aiAccepted && <div className="mt-5"><AiDisclosure accepted={false} onAccept={() => updateSettings({ aiDisclosureAccepted: true, aiEnabled: true })} /></div>}{aiOpen && aiAccepted && !aiReport && <Button className="mt-5" disabled={loading} onClick={generateAi}>{loading ? 'Gerando…' : 'Gerar narrativa agora'}</Button>}{aiReport && <div className="mt-5 rounded-2xl bg-white/[0.035] p-4"><p className="text-sm leading-relaxed text-slate-200">{aiReport.summary}</p>{aiReport.attention?.length > 0 && <ul className="mt-3 space-y-2 text-xs text-slate-400">{aiReport.attention.map((item) => <li key={String(item)}>• {typeof item === 'string' ? item : item.title || item.description}</li>)}</ul>}{aiReport.nextSteps?.length > 0 && <ul className="mt-3 space-y-2 text-xs text-cyan-200">{aiReport.nextSteps.map((item) => <li key={String(item)}>→ {item}</li>)}</ul>}{aiReport.mode === 'local' && <p className="mt-3 text-xs font-semibold text-amber-300">Modo local · a IA externa não respondeu.</p>}<Button className="mt-4" variant="ghost" onClick={generateAi}>Regenerar narrativa</Button></div>}</Card></div></div>
  </>
}
