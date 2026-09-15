import { aggregateFinance } from './finance'
import { monthKey } from './format'

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100

function topCategories(totals = {}, limit = 3) {
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount: roundMoney(amount) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

function summarizeFinance(state) {
  const finance = aggregateFinance(state, monthKey())
  return {
    income: roundMoney(Number(state.profile?.income) || finance.income),
    expenses: roundMoney(finance.expenses),
    remainder: roundMoney(finance.result),
    commitments: roundMoney(finance.subsMonthly + finance.installmentsMonthly),
    reserve: roundMoney(finance.reserve),
    netWorth: roundMoney(finance.netWorth),
    categories: topCategories(finance.spentByCategory, 8),
  }
}

export function buildPlannerPayload(state, question, history = []) {
  return {
    question: String(question || '').slice(0, 800),
    history: history.slice(-6).map(({ role, text }) => ({
      role: role === 'assistant' ? 'assistant' : 'user',
      text: String(text || '').slice(0, 800),
    })),
    summary: summarizeFinance(state),
  }
}

export function buildMonthlyReportPayload(finance, insights = []) {
  return {
    totals: {
      income: roundMoney(finance.income),
      expenses: roundMoney(finance.expenses),
      result: roundMoney(finance.result),
      reserve: roundMoney(finance.reserve),
      netWorth: roundMoney(finance.netWorth),
    },
    topCategories: topCategories(finance.spentByCategory, 3),
    insights: insights.slice(0, 5).map(({ title, description, text }) => ({
      title: String(title || '').slice(0, 120),
      description: String(description || text || '').slice(0, 240),
    })),
  }
}

export function buildStatementPayload(text, metadata = {}) {
  return {
    text: String(text || '').slice(0, 50000),
    format: ['csv', 'ofx', 'text'].includes(metadata.format) ? metadata.format : 'text',
  }
}
