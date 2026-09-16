import { formatCurrency } from './format'

function topCategories(spentByCategory = {}, limit = 3) {
  return Object.entries(spentByCategory)
    .map(([category, amount]) => ({ category, amount: Number(amount) || 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

export function buildMonthlyReport(finance, insights = []) {
  const positive = finance.result >= 0
  return {
    summary: positive
      ? `O mês fechou com ${formatCurrency(finance.result)} livres depois de ${formatCurrency(finance.expenses)} em despesas.`
      : `O mês fechou ${formatCurrency(Math.abs(finance.result))} no negativo, com despesas acima das entradas.`,
    attentionPoints: insights.slice(0, 3).map((item) => `${item.title}: ${item.text || item.description || ''}`),
    nextSteps: positive
      ? ['Dê um destino ao valor que sobrou.', finance.savingsRate < 20 ? 'Aproxime sua poupança de 20% da renda, no seu ritmo.' : 'Mantenha o ritmo e revise suas metas.']
      : ['Pause gastos flexíveis até equilibrar o mês.', 'Revise orçamento e compromissos recorrentes antes da próxima fatura.'],
    topCategories: topCategories(finance.spentByCategory),
  }
}

export function normalizeAiReport(reply, fallback) {
  if (!reply || typeof reply !== 'object') return fallback
  return {
    summary: String(reply.summary || fallback.summary),
    attentionPoints: Array.isArray(reply.attention)
      ? reply.attention.map((item) => typeof item === 'string' ? item : String(item?.title || item?.text || '')).filter(Boolean)
      : fallback.attentionPoints,
    nextSteps: Array.isArray(reply.nextSteps)
      ? reply.nextSteps.map((item) => String(item)).filter(Boolean)
      : fallback.nextSteps,
  }
}
