const DIMENSIONS = ['tolerance', 'capacity', 'horizon', 'liquidity', 'knowledge']

export function scoreSuitability(answers = {}) {
  const score = DIMENSIONS.reduce((sum, key) => sum + Number(answers[key] || 0), 0)
  const profile = score <= 8 ? 'conservador' : score <= 15 ? 'equilibrado' : 'arrojado'
  return {
    ...answers,
    tolerance: Number(answers.tolerance || 0),
    capacity: Number(answers.capacity || 0),
    horizon: Number(answers.horizon || 0),
    liquidity: Number(answers.liquidity || 0),
    knowledge: Number(answers.knowledge || 0),
    reasons: Array.isArray(answers.reasons) ? answers.reasons : [],
    priorities: Array.isArray(answers.priorities) ? answers.priorities : [],
    profile,
    updatedAt: new Date().toISOString(),
  }
}

export function normalizeAllocation(allocation = {}) {
  const normalized = Object.fromEntries(
    Object.entries(allocation).map(([key, value]) => [key, Number(value || 0)]),
  )
  const total = Object.values(normalized).reduce((sum, value) => sum + value, 0)
  if (Math.round(total * 100) / 100 !== 100) throw new Error('allocation_total')
  return normalized
}

export function compareAllocation(current = {}, desired = {}) {
  const keys = new Set([...Object.keys(current), ...Object.keys(desired)])
  return Object.fromEntries(
    [...keys].map((key) => [key, Math.round((Number(desired[key] || 0) - Number(current[key] || 0)) * 100) / 100]),
  )
}

export function profileAllocation(profile = 'equilibrado') {
  if (profile === 'conservador') return { stable: 75, variable: 10, international: 10, realAssets: 5 }
  if (profile === 'arrojado') return { stable: 25, variable: 40, international: 20, realAssets: 15 }
  return { stable: 50, variable: 25, international: 15, realAssets: 10 }
}

export function portfolioAllocation(investments = []) {
  const totals = { stable: 0, variable: 0, international: 0, realAssets: 0 }
  const classify = (category = '') => {
    const value = category.toLowerCase()
    if (value.includes('renda fixa') || value.includes('cdb') || value.includes('tesouro')) return 'stable'
    if (value.includes('intern')) return 'international'
    if (value.includes('fii') || value.includes('imob')) return 'realAssets'
    return 'variable'
  }

  for (const item of investments) totals[classify(item.category)] += Number(item.currentValue || item.investedValue || 0)
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0)
  if (!total) return totals
  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Math.round((value / total) * 10000) / 100]))
}
