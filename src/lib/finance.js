import { clamp } from './format'

const sum = (items, field) => Math.round(items.reduce((total, item) => total + (Number(item[field]) || 0), 0) * 100) / 100
const monthOf = (date) => String(date || '').slice(0, 7)

function previousMonth(key) {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function categoryTotals(transactions) {
  return transactions.filter((item) => item.type === 'expense').reduce((totals, item) => {
    totals[item.category || 'Outros'] = Math.round(((totals[item.category || 'Outros'] || 0) + (Number(item.amount) || 0)) * 100) / 100
    return totals
  }, {})
}

export function aggregateFinance(state, selectedMonth) {
  const transactions = state.transactions || []
  const current = transactions.filter((item) => monthOf(item.date) === selectedMonth)
  const previous = transactions.filter((item) => monthOf(item.date) === previousMonth(selectedMonth))
  const income = sum(current.filter((item) => item.type === 'income'), 'amount')
  const expenses = sum(current.filter((item) => item.type === 'expense'), 'amount')
  const previousExpenses = sum(previous.filter((item) => item.type === 'expense'), 'amount')
  const result = Math.round((income - expenses) * 100) / 100
  const profileIncome = Number(state.profile?.income) || income
  const savingsRate = income > 0 ? Math.round((result / income) * 1000) / 10 : 0
  const subsMonthly = sum((state.subscriptions || []).filter((item) => item.active), 'monthlyValue')
  const installmentsMonthly = sum(state.installments || [], 'monthlyValue')
  const reserve = Number(state.profile?.reserveAmount) || 0
  const essentialCost = Number(state.profile?.essentialCost) || 0
  const reserveTarget = essentialCost * (Number(state.profile?.monthsGoal) || 6)
  const monthsCovered = essentialCost > 0 ? Math.round((reserve / essentialCost) * 10) / 10 : 0
  const reservePct = reserveTarget > 0 ? clamp((reserve / reserveTarget) * 100) : 0
  const assetsTotal = sum(state.assets || [], 'value')
  const liabilitiesTotal = sum(state.liabilities || [], 'value')
  const spentByCategory = categoryTotals(current)
  const previousSpentByCategory = categoryTotals(previous)
  const overBudget = (state.budgets || []).map((budget) => ({ ...budget, spent: spentByCategory[budget.category] || 0 })).filter((budget) => budget.spent > Number(budget.limit || 0))
  const cardUtilization = (state.cards || []).map((card) => ({ id: card.id, name: card.name, utilization: Number(card.limit) > 0 ? Math.round((Number(card.currentBill) / Number(card.limit)) * 1000) / 10 : 0 }))
  const cashFlowPoints = result > 0 ? 30 : result === 0 ? 15 : 0
  const savingPoints = clamp(savingsRate, 0, 20)
  const reservePoints = clamp(reservePct / 4, 0, 25)
  const maxCard = Math.max(0, ...cardUtilization.map((item) => item.utilization))
  const cardPoints = clamp(15 * (1 - maxCard / 100), 0, 15)
  const debtRatio = profileIncome > 0 ? liabilitiesTotal / (profileIncome * 12) : 0
  const debtPoints = clamp(10 * (1 - debtRatio), 0, 10)
  return {
    income, expenses, previousExpenses, result, savingsRate, subsMonthly, installmentsMonthly,
    reserve, reserveTarget, reservePct, monthsCovered, assetsTotal, liabilitiesTotal,
    netWorth: Math.round((assetsTotal - liabilitiesTotal) * 100) / 100,
    spentByCategory, previousSpentByCategory, overBudget, cardUtilization,
    positiveMonthStreak: result > 0 && previousExpenses > 0 ? 2 : result > 0 ? 1 : 0,
    healthScore: Math.round(clamp(cashFlowPoints + savingPoints + reservePoints + cardPoints + debtPoints)),
  }
}
