export function projectWealth({ initial = 0, monthlyContribution = 0, annualRate = 0, months = 12, extraContributions = [] }) {
  const monthlyRate = (1 + Number(annualRate || 0)) ** (1 / 12) - 1
  let balance = Number(initial) || 0
  const extras = new Map((extraContributions || []).map((item) => [Number(item.month), Number(item.amount || 0)]))
  const result = [{ month: 0, balance: Math.round(balance * 100) / 100 }]

  for (let month = 1; month <= Number(months || 0); month += 1) {
    balance = balance * (1 + monthlyRate) + (Number(monthlyContribution) || 0) + (extras.get(month) || 0)
    result.push({ month, balance: Math.round(balance * 100) / 100 })
  }
  return result
}

export function compareWealthScenarios({ initial = 0, monthlyContribution = 0, months = 12, extraContributions = [] }) {
  return [
    { label: 'Conservador', rate: 0.06 },
    { label: 'Moderado', rate: 0.10 },
    { label: 'Arrojado', rate: 0.15 },
  ].map((scenario) => {
    const points = projectWealth({ initial, monthlyContribution, annualRate: scenario.rate, months, extraContributions })
    return { ...scenario, final: points.at(-1)?.balance || Number(initial || 0), points }
  })
}
