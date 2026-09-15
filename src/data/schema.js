export const EMPTY_STATE = {
  version: 1,
  transactions: [], cards: [], installments: [], subscriptions: [], budgets: [], goals: [],
  assets: [], liabilities: [], investments: [],
  profile: {
    name: '', income: 0, essentialCost: 0, monthsGoal: 6, reserveAmount: 0, payday: 5,
    closingDay: 25, completedLessons: [], hasBusiness: false, proLabore: 0,
    profitDistribution: 0, onboarded: false,
  },
  investmentProfile: { answers: {}, profile: 'equilibrado' },
  atePagamento: null,
}

const collections = ['transactions', 'cards', 'installments', 'subscriptions', 'budgets', 'goals', 'assets', 'liabilities', 'investments']

export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function createId(prefix = 'item') {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${random}`
}

export function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {}
  const result = clone(EMPTY_STATE)
  result.version = 1
  for (const key of collections) result[key] = Array.isArray(source[key]) ? source[key] : []
  result.profile = { ...result.profile, ...(source.profile && typeof source.profile === 'object' ? source.profile : {}) }
  result.profile.completedLessons = Array.isArray(result.profile.completedLessons) ? result.profile.completedLessons : []
  result.investmentProfile = { ...result.investmentProfile, ...(source.investmentProfile || {}) }
  result.atePagamento = source.atePagamento && typeof source.atePagamento === 'object' ? source.atePagamento : null
  return result
}
