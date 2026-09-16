const money = (value) => Math.round(Number(value || 0) * 100) / 100

export function detectCommitments(state = {}, untilDate) {
  const recurring = (state.transactions || [])
    .filter((item) => item.type === 'expense' && item.recurring)
    .map((item) => ({ id: `recurring:${item.id}`, sourceId: item.id, source: 'recurring', description: item.description || item.category || 'Despesa recorrente', amount: money(item.amount), dueDate: untilDate || null, type: 'expense' }))

  const installments = (state.installments || [])
    .filter((item) => Number(item.remainingMonths || 0) > 0 && Number(item.monthlyValue || 0) > 0)
    .map((item) => ({ id: `installment:${item.id}`, sourceId: item.id, source: 'installment', description: item.description || 'Parcelamento', amount: money(item.monthlyValue), dueDate: untilDate || null, type: 'expense' }))

  const subscriptions = (state.subscriptions || [])
    .filter((item) => item.active && Number(item.monthlyValue || 0) > 0)
    .map((item) => ({ id: `subscription:${item.id}`, sourceId: item.id, source: 'subscription', description: item.name || 'Assinatura', amount: money(item.monthlyValue), dueDate: untilDate || null, type: 'expense' }))

  return [...recurring, ...installments, ...subscriptions]
}

export function calculateUntilPayday({
  balance = 0,
  plannedItems = [],
  extraItems = [],
  paidItemIds = [],
  safetyReserve = 0,
  todaySpent = 0,
  extraIncome: directExtraIncome = 0,
  nextPaymentDate,
  today = new Date().toISOString().slice(0, 10),
} = {}) {
  const allItems = [...(plannedItems || []), ...(extraItems || [])]
  const activeItems = allItems.filter((item) => !(paidItemIds || []).includes(item.id))
  const committed = money(activeItems.filter((item) => item.type !== 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0))
  const recordedIncome = activeItems.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const extraIncome = money(recordedIncome + Number(directExtraIncome || 0))
  const remainingFree = money(Number(balance || 0) + extraIncome - committed - Number(safetyReserve || 0) - Number(todaySpent || 0))

  const target = new Date(`${nextPaymentDate}T12:00:00`)
  const origin = new Date(`${today}T12:00:00`)
  const rawDays = Math.ceil((target - origin) / 86400000)
  const isExpired = !Number.isFinite(rawDays) || rawDays < 0
  const days = Math.max(0, Number.isFinite(rawDays) ? rawDays : 0)
  const dailyRhythm = days > 0 ? money(remainingFree / days) : 0
  const weeklyRhythm = days > 0 ? money(dailyRhythm * 7) : 0
  const status = remainingFree < 0 ? 'critical' : dailyRhythm < 50 ? 'attention' : 'healthy'

  return { days, committed, extraIncome, remainingFree, dailyRhythm, weeklyRhythm, status, isExpired }
}

export function simulatePayday(plan, item) {
  const simulated = {
    ...plan,
    extraItems: [...(plan?.extraItems || []), { id: item.id || 'simulation', description: item.description || (item.type === 'income' ? 'Renda extra' : 'Gasto simulado'), amount: money(item.amount), type: item.type === 'income' ? 'income' : 'expense' }],
  }
  return calculateUntilPayday(simulated)
}
