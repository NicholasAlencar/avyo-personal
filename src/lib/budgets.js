function shiftMonth(month, delta) {
  const [year, monthNumber] = String(month).split('-').map(Number)
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function roundedSuggestion(values) {
  if (!values.length) return 0
  const average = values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
  if (average <= 0) return 0
  return Math.ceil(average / 50) * 50
}

export function buildBudgetRows(state, selectedMonth) {
  const months = [selectedMonth, shiftMonth(selectedMonth, -1), shiftMonth(selectedMonth, -2)]
  const budgets = Array.isArray(state?.budgets) ? state.budgets : []
  const expenses = (Array.isArray(state?.transactions) ? state.transactions : []).filter((transaction) => transaction.type === 'expense')
  const relevantExpenses = expenses.filter((transaction) => months.includes(String(transaction.date || '').slice(0, 7)))
  const categories = new Set([
    ...budgets.map((budget) => budget.category).filter(Boolean),
    ...relevantExpenses.map((transaction) => transaction.category).filter(Boolean),
  ])

  return [...categories]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((category) => {
      const budget = budgets.find((item) => item.category === category)
      const history = months.map((month) => relevantExpenses
        .filter((transaction) => transaction.category === category && String(transaction.date || '').slice(0, 7) === month)
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0))

      return {
        id: budget?.id ?? null,
        category,
        limit: budget ? Number(budget.limit || 0) : null,
        spent: history[0],
        suggested: roundedSuggestion(history),
        history,
      }
    })
}
