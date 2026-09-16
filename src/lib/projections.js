export function projectWealth({ initial = 0, monthlyContribution = 0, annualRate = 0, months = 12 }) {
  const monthlyRate = (1 + Number(annualRate || 0)) ** (1 / 12) - 1
  let balance = Number(initial) || 0
  const result = [{ month: 0, balance }]
  for (let month = 1; month <= months; month += 1) {
    balance = balance * (1 + monthlyRate) + (Number(monthlyContribution) || 0)
    result.push({ month, balance: Math.round(balance * 100) / 100 })
  }
  return result
}

export function projectVariableContributions({ initial = 0, annualRate = 0, months = 12, contributions = [] } = {}) {
  const monthlyRate = Math.pow(1 + Number(annualRate || 0), 1 / 12) - 1
  let balance = Number(initial) || 0
  let contributed = 0
  const normalized = Array.isArray(contributions) ? contributions.map((value) => Number(value || 0)) : []
  const points = [{ month: 0, balance: Math.round(balance * 100) / 100, contributed }]

  for (let month = 1; month <= Math.max(0, Number(months || 0)); month += 1) {
    const contribution = Number(normalized[month - 1] ?? normalized.at(-1) ?? 0)
    contributed += contribution
    balance = balance * (1 + monthlyRate) + contribution
    points.push({
      month,
      balance: Math.round(balance * 100) / 100,
      contributed: Math.round(contributed * 100) / 100,
    })
  }

  return points
}
