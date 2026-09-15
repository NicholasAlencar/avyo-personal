import { clone } from './schema'

function isoDate(monthOffset = 0, day = 1) {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth() + monthOffset, day, 12).toISOString().slice(0, 10)
}

const DEMO_STATE = {
  version: 1,
  profile: { name: 'Marina', income: 7800, essentialCost: 3400, monthsGoal: 6, reserveAmount: 12600, payday: 5, closingDay: 25, completedLessons: ['primeiros-passos'], hasBusiness: false, proLabore: 0, profitDistribution: 0, onboarded: true },
  transactions: [
    { id: 'tx-salario', type: 'income', description: 'Salário', amount: 7800, category: 'Renda', date: isoDate(0, 5), recurring: true },
    { id: 'tx-moradia', type: 'expense', description: 'Aluguel', amount: 1850, category: 'Moradia', date: isoDate(0, 6), recurring: true },
    { id: 'tx-mercado', type: 'expense', description: 'Mercado do bairro', amount: 640, category: 'Alimentação', date: isoDate(0, 9), recurring: false },
    { id: 'tx-transporte', type: 'expense', description: 'Transporte', amount: 290, category: 'Transporte', date: isoDate(0, 10), recurring: false },
    { id: 'tx-saude', type: 'expense', description: 'Plano de saúde', amount: 420, category: 'Saúde', date: isoDate(0, 11), recurring: true },
    { id: 'tx-lazer', type: 'expense', description: 'Cinema e jantar', amount: 235, category: 'Lazer', date: isoDate(0, 13), recurring: false },
    { id: 'tx-mercado-prev', type: 'expense', description: 'Supermercado', amount: 410, category: 'Alimentação', date: isoDate(-1, 12), recurring: false },
  ],
  cards: [
    { id: 'card-nubank', name: 'Ultravioleta', institution: 'Nubank', brand: 'Mastercard', last4: '8842', limit: 6500, closingDay: 25, dueDay: 4, currentBill: 2180 },
    { id: 'card-inter', name: 'Inter Gold', institution: 'Inter', brand: 'Visa', last4: '3019', limit: 3000, closingDay: 18, dueDay: 26, currentBill: 620 },
  ],
  installments: [
    { id: 'inst-note', cardId: 'card-nubank', description: 'Notebook', totalValue: 4800, installmentsCount: 12, currentInstallment: 7, monthlyValue: 400, remainingMonths: 5 },
    { id: 'inst-course', cardId: 'card-inter', description: 'Curso de idiomas', totalValue: 900, installmentsCount: 6, currentInstallment: 4, monthlyValue: 150, remainingMonths: 2 },
  ],
  subscriptions: [
    { id: 'sub-spotify', name: 'Spotify', monthlyValue: 21.9, category: 'Entretenimento', active: true, lastUsedDate: isoDate(0, 14) },
    { id: 'sub-cloud', name: 'Cloud Drive', monthlyValue: 49.9, category: 'Serviços', active: true, lastUsedDate: isoDate(-4, 3) },
    { id: 'sub-gym', name: 'Academia', monthlyValue: 119.9, category: 'Saúde', active: true, lastUsedDate: isoDate(0, 12) },
  ],
  budgets: [
    { id: 'budget-food', category: 'Alimentação', limit: 900 },
    { id: 'budget-leisure', category: 'Lazer', limit: 450 },
    { id: 'budget-transport', category: 'Transporte', limit: 500 },
  ],
  goals: [
    { id: 'goal-trip', name: 'Viagem para o Chile', total: 9000, saved: 3600, deadline: isoDate(8, 1) },
    { id: 'goal-course', name: 'Especialização', total: 6000, saved: 2100, deadline: isoDate(5, 1) },
  ],
  assets: [
    { id: 'asset-cash', name: 'Conta e reserva', type: 'dinheiro', value: 18200 },
    { id: 'asset-car', name: 'Carro', type: 'carro', value: 42000 },
  ],
  liabilities: [{ id: 'liab-car', name: 'Financiamento do carro', type: 'financiamento', value: 12800 }],
  investments: [
    { id: 'inv-cdb', name: 'CDB Liquidez Diária', institution: 'Banco Inter', category: 'Renda fixa', investedValue: 8000, currentValue: 8460, date: isoDate(-10, 8), returnRate: 5.75, note: 'Reserva complementar' },
    { id: 'inv-etf', name: 'ETF Brasil', institution: 'Corretora', category: 'Ações', investedValue: 3500, currentValue: 3820, date: isoDate(-8, 10), returnRate: 9.14, note: '' },
  ],
  investmentProfile: { answers: {}, profile: 'equilibrado' },
  atePagamento: { id: 'payday-plan', balance: 3150, nextPaymentDate: isoDate(1, 5), status: 'active', plannedItems: [{ id: 'planned-1', description: 'Contas restantes', amount: 980 }], safetyReserve: 600, expectedIncome: 7800 },
}

export function createInitialState() {
  return clone(DEMO_STATE)
}
