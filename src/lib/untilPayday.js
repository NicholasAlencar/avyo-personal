export function calculateUntilPayday({ balance = 0, plannedItems = [], safetyReserve = 0, nextPaymentDate, today = new Date().toISOString().slice(0, 10) }) {
  const remainingFree = Math.round((Number(balance) - plannedItems.reduce((total, item) => total + Number(item.amount || 0), 0) - Number(safetyReserve)) * 100) / 100
  const rawDays = Math.ceil((new Date(`${nextPaymentDate}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000)
  const isExpired = !Number.isFinite(rawDays) || rawDays < 0
  const days = Math.max(0, rawDays || 0)
  const dailyRhythm = days > 0 ? Math.round((remainingFree / days) * 100) / 100 : 0
  const status = remainingFree < 0 ? 'critical' : dailyRhythm < 30 ? 'attention' : 'comfortable'
  return { remainingFree, days, dailyRhythm, status, isExpired }
}
