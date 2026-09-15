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
