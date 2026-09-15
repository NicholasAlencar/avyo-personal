export const formatCurrency = (value, options = {}) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: options.cents === false ? 0 : 2 }).format(Number(value) || 0)
export const formatPercent = (value) => `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Number(value) || 0)}%`
export const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`)) : 'Sem data'
export const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
export const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0))
