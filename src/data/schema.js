export const EMPTY_STATE = {
  version: 2,
  transactions: [], cards: [], installments: [], subscriptions: [], budgets: [], goals: [],
  assets: [], liabilities: [], investments: [],
  profile: {
    name: '', income: 0, essentialCost: 0, monthsGoal: 6, reserveAmount: 0, payday: 5,
    closingDay: 25, completedLessons: [], hasBusiness: false, businessConnected: false,
    proLabore: 0, profitDistribution: 0, businessPersonalExpenses: 0,
    businessNetWorth: 0, email: '', monthlyInvestmentGoal: 0,
    investmentTotalGoal: 0, onboarded: false,
  },
  investmentProfile: {
    answers: {}, profile: 'equilibrado', tolerance: 0, capacity: 0,
    horizon: 0, reasons: [], priorities: [], updatedAt: null,
  },
  atePagamento: null,
  settings: { aiEnabled: false, aiDisclosureAccepted: false },
}

const collections = ['transactions', 'cards', 'installments', 'subscriptions', 'budgets', 'goals', 'assets', 'liabilities', 'investments']

export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function createId(prefix = 'item') {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${random}`
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function normalizeState(value) {
  const source = isObject(value) ? value : {}
  const result = clone(EMPTY_STATE)
  result.version = 2
  for (const key of collections) result[key] = Array.isArray(source[key]) ? source[key] : []
  result.profile = { ...result.profile, ...(isObject(source.profile) ? source.profile : {}) }
  result.profile.completedLessons = Array.isArray(result.profile.completedLessons) ? result.profile.completedLessons : []
  result.investmentProfile = { ...result.investmentProfile, ...(isObject(source.investmentProfile) ? source.investmentProfile : {}) }
  result.investmentProfile.reasons = Array.isArray(result.investmentProfile.reasons) ? result.investmentProfile.reasons : []
  result.investmentProfile.priorities = Array.isArray(result.investmentProfile.priorities) ? result.investmentProfile.priorities : []
  result.settings = { ...result.settings, ...(isObject(source.settings) ? source.settings : {}) }
  result.atePagamento = isObject(source.atePagamento) ? {
    extraItems: [], paidItemIds: [], todaySpent: 0,
    createdAt: new Date().toISOString(), ...source.atePagamento,
  } : null
  if (result.atePagamento) {
    result.atePagamento.extraItems = Array.isArray(result.atePagamento.extraItems) ? result.atePagamento.extraItems : []
    result.atePagamento.paidItemIds = Array.isArray(result.atePagamento.paidItemIds) ? result.atePagamento.paidItemIds : []
  }
  return result
}
