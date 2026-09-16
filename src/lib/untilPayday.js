const DAY = 86400000

function money(value) {
  return Math.round(Number(value || 0) * 100) / 100
}

function parseDate(value) {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function isBetween(dateValue, fromValue, untilValue) {
  const date = parseDate(dateValue)
  const from = parseDate(fromValue)
  const until = parseDate(untilValue)
  if (!date || !from || !until) return false
  return date >= from && date <= until
}

export function detectCommitments(state, untilDate, today = new Date().toISOString().slice(0, 10)) {
  if (!state || !untilDate) return []

  const items = []
  const seen = new Set()
  const push = (item) => {
    if (!item?.id || seen.has(item.id) || Number(item.amount || 0) <= 0) return
    seen.add(item.id)
    items.push({ ...item, amount: money(item.amount) })
  }

  for (const transaction of state.transactions || []) {
    if (transaction.type !== 'expense' || !transaction.recurring) continue
    if (!isBetween(transaction.date, today, untilDate)) continue
    push({
      id: transaction.id,
      description: transaction.description || transaction.category || 'Despesa recorrente',
      amount: transaction.amount,
      source: 'transaction',
    })
  }

  for (const installment of state.installments || []) {
    if (Number(installment.remainingMonths || 0) <= 0) continue
    push({
      id: installment.id,
      description: installment.description || 'Parcela',
      amount: installment.monthlyValue,
      source: 'installment',
    })
  }

  for (const subscription of state.subscriptions || []) {
    if (!subscription.active) continue
    push({
      id: subscription.id,
      description: subscription.name || 'Assinatura',
      amount: subscription.monthlyValue,
      source: 'subscription',
    })
  }

  return items
}

export function calculateUntilPayday({
  balance = 0,
  plannedItems = [],
  extraItems = [],
  paidItemIds = [],
  safetyReserve = 0,
  todaySpent = 0,
  extraIncome = 0,
  nextPaymentDate,
  today = new Date().toISOString().slice(0, 10),
} = {}) {
  const paid = new Set(paidItemIds || [])
  const activeItems = [...(plannedItems || []), ...(extraItems || [])]
    .filter((item) => !paid.has(item.id))
  const committed = money(activeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0))
  const remainingFree = money(
    Number(balance || 0) + Number(extraIncome || 0) - committed - Number(safetyReserve || 0) - Number(todaySpent || 0),
  )

  const paymentDate = parseDate(nextPaymentDate)
  const todayDate = parseDate(today)
  const rawDays = paymentDate && todayDate ? Math.ceil((paymentDate - todayDate) / DAY) : -1
  const isExpired = !Number.isFinite(rawDays) || rawDays < 0
  const days = Math.max(0, rawDays || 0)
  const dailyRhythm = days > 0 ? money(remainingFree / days) : 0
  const weeklyRhythm = days > 0 ? money(dailyRhythm * 7) : 0
  const status = remainingFree < 0 ? 'critical' : dailyRhythm < 50 ? 'attention' : 'healthy'

  return {
    committed,
    remainingFree,
    days,
    dailyRhythm,
    weeklyRhythm,
    status,
    isExpired,
  }
}

export function simulatePayday(plan, item = {}) {
  const amount = Math.max(0, Number(item.amount || 0))
  if (item.type === 'income') {
    return calculateUntilPayday({ ...plan, extraIncome: Number(plan?.extraIncome || 0) + amount })
  }
  return calculateUntilPayday({ ...plan, todaySpent: Number(plan?.todaySpent || 0) + amount })
}
