import { useMemo } from 'react'
import { Printer } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { buildInsights } from '../lib/insights'
import { buildMonthlyReport } from '../lib/report'
import { formatCurrency, monthKey } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'

export function ReportPage() {
  const { state } = useFinanceStore()
  const finance = useMemo(() => aggregateFinance(state, monthKey()), [state])
  const insights = useMemo(() => buildInsights(finance, state), [finance, state])
  const localReport = useMemo(() => buildMonthlyReport(finance, insights), [finance, insights])
  const narrative = localReport

  return <>
    <PageHeader
      eyebrow="Leitura mensal"
      title="Relatório do mês"
      subtitle="Os números e a leitura narrativa são calculados localmente neste navegador."
      action={<Button variant="secondary" onClick={() => window.print()}><Printer size={17} />Imprimir</Button>}
    />

    <div className="grid gap-4 sm:grid-cols-3">
      {[
        ['Receitas do mês', finance.income, 'text-emerald-300', 'report-income'],
        ['Despesas do mês', finance.expenses, 'text-rose-300', 'report-expenses'],
        ['Resultado do mês', finance.result, 'text-cyan-300', 'report-result'],
      ].map(([label, value, tone, testId]) => <Card key={label} className="p-5">
        <p className="text-sm text-slate-500">{label}</p>
        <strong data-testid={testId} className={`mt-2 block font-heading text-2xl ${tone}`}>{formatCurrency(value)}</strong>
      </Card>)}
    </div>

    <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Leitura narrativa</p>
            <h2 className="mt-2 font-heading text-xl font-semibold">Resumo</h2>
          </div>
        </div>
        <p data-testid="report-summary" className="mt-4 leading-relaxed text-slate-300">{narrative.summary}</p>
        <p className="mt-5 text-sm text-slate-500">Leitura 100% local. A IA remota permanece bloqueada até existir acesso autenticado.</p>
      </Card>

      <Card className="p-6">
        <h2 className="font-heading text-xl font-semibold">Principais categorias</h2>
        <p className="mt-2 text-sm text-slate-500">Valores calculados localmente a partir das despesas do mês.</p>
        <div className="mt-5 space-y-3">
          {localReport.topCategories.length ? localReport.topCategories.map((item) => <div key={item.category} className="flex items-center justify-between rounded-xl bg-white/[0.035] p-3">
            <span className="text-sm text-slate-300">{item.category}</span>
            <strong className="text-sm text-white">{formatCurrency(item.amount)}</strong>
          </div>) : <p className="text-sm text-slate-500">Sem despesas categorizadas neste mês.</p>}
        </div>
      </Card>
    </div>

    <article className="mt-4 grid gap-4 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="font-heading text-xl font-semibold">Pontos de atenção</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {(narrative.attentionPoints || []).length ? narrative.attentionPoints.map((point) => <li key={point} className="rounded-xl bg-white/[0.03] p-3">{point}</li>) : <li className="rounded-xl bg-white/[0.03] p-3 text-slate-500">Nenhum ponto crítico destacado.</li>}
        </ul>
      </Card>
      <Card className="p-6">
        <h2 className="font-heading text-xl font-semibold">Próximos passos</h2>
        <ol className="mt-4 space-y-3">
          {(narrative.nextSteps || []).map((step, index) => <li key={`${step}-${index}`} className="flex gap-3 text-sm text-slate-300"><span className="grid size-6 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-xs text-cyan-300">{index + 1}</span>{step}</li>)}
        </ol>
      </Card>
    </article>
  </>
}
