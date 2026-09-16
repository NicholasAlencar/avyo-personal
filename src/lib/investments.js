const scoreKeys = ['tolerance', 'capacity', 'horizon', 'liquidity', 'knowledge']

export function scoreSuitability(answers = {}) {
  const score = scoreKeys.reduce((sum, key) => sum + Number(answers[key] || 0), 0)
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
    score,
    profile,
    updatedAt: new Date().toISOString(),
  }
}

export function normalizeAllocation(allocation = {}) {
  const normalized = Object.fromEntries(Object.entries(allocation).map(([key, value]) => [key, Number(value || 0)]))
  const total = Object.values(normalized).reduce((sum, value) => sum + value, 0)
  if (Math.round(total * 100) / 100 !== 100) throw new Error('allocation_total')
  return normalized
}

export function compareAllocation(current = {}, desired = {}) {
  const categories = [...new Set([...Object.keys(current), ...Object.keys(desired)])]
  return categories.map((category) => ({
    category,
    current: Number(current[category] || 0),
    desired: Number(desired[category] || 0),
    difference: Number(desired[category] || 0) - Number(current[category] || 0),
  }))
}

export const PROFILE_ALLOCATION = {
  conservador: { stable: 75, variable: 10, international: 10, realEstate: 5 },
  equilibrado: { stable: 50, variable: 25, international: 15, realEstate: 10 },
  arrojado: { stable: 25, variable: 40, international: 20, realEstate: 15 },
}

export function currentAllocation(investments = []) {
  const totals = { stable: 0, variable: 0, international: 0, realEstate: 0 }
  const mapCategory = (category = '') => {
    const value = category.toLowerCase()
    if (value.includes('fixa') || value.includes('cdb') || value.includes('tesouro')) return 'stable'
    if (value.includes('intern')) return 'international'
    if (value.includes('fii') || value.includes('imob')) return 'realEstate'
    return 'variable'
  }
  let total = 0
  for (const item of investments) {
    const value = Number(item.currentValue || 0)
    totals[mapCategory(item.category)] += value
    total += value
  }
  if (!total) return totals
  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Math.round(value / total * 10000) / 100]))
}
