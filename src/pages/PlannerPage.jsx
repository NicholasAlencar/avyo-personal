import { useMemo } from 'react'
import { useFinanceStore } from '../context/FinanceContext'
import { aggregateFinance } from '../lib/finance'
import { formatCurrency, monthKey } from '../lib/format'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { PlannerChat } from '../components/avyo/PlannerChat'

export function PlannerPage() {
  const { state } = useFinanceStore()
  const finance = useMemo(() => aggregateFinance(state, monthKey()), [state])
  const indicators = [
    { label: 'Receitas', value: finance.income, tone: 'text-emerald-300' },
    { label: 'Despesas', value: finance.expenses, tone: 'text-rose-300' },
    { label: 'Resultado', value: finance.result, tone: finance.result >= 0 ? 'text-cyan-200' : 'text-rose-300' },
    { label: 'Reserva', value: finance.reserve, tone: 'text-violet-200' },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Orientação personalizada"
        title="Meu Planejador"
        subtitle="Converse sobre seu mês com contexto financeiro resumido, sem transformar orientação em recomendação automática."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores para o planejador">
        {indicators.map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
            <strong className={`mt-2 block font-heading text-xl ${item.tone}`}>{formatCurrency(item.value)}</strong>
          </Card>
        ))}
      </div>

      <PlannerChat state={state} />

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        O Planejador usa cálculos locais como base. Quando a IA opcional estiver habilitada e o compartilhamento aceito, somente agregados financeiros e a mensagem da conversa são enviados; o histórico desta tela não é persistido.
      </p>
    </>
  )
}
