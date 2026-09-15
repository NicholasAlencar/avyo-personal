import { formatCurrency } from './format'

export function buildMonthlyReport(finance, insights = []) {
  const positive = finance.result >= 0
  return {
    summary: positive
      ? `O mês fechou com ${formatCurrency(finance.result)} livres depois de ${formatCurrency(finance.expenses)} em despesas.`
      : `O mês fechou ${formatCurrency(Math.abs(finance.result))} no negativo, com despesas acima das entradas.`,
    attentionPoints: insights.slice(0, 3).map((item) => `${item.title}: ${item.text}`),
    nextSteps: positive
      ? ['Dê um destino ao valor que sobrou.', finance.savingsRate < 20 ? 'Aproxime sua poupança de 20% da renda, no seu ritmo.' : 'Mantenha o ritmo e revise suas metas.']
      : ['Pause gastos flexíveis até equilibrar o mês.', 'Revise orçamento e compromissos recorrentes antes da próxima fatura.'],
  }
}
