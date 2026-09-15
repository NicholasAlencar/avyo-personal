import { formatCurrency } from './format'

const insight = (id, tone, priority, title, text, to) => ({ id, tone, priority, title, text, to })

export function evaluateInsightRules(f, state, now = new Date()) {
  const results = []
  const categoryTrend = Object.entries(f.spentByCategory || {}).map(([category, spent]) => {
    const previous = f.previousSpentByCategory?.[category] || 0
    return { category, spent, previous, increase: previous > 0 ? ((spent - previous) / previous) * 100 : 0 }
  }).filter((item) => item.previous > 80 && item.increase > 15).sort((a, b) => b.increase - a.increase)[0]
  if (categoryTrend) results.push(insight('category-trend', 'amber', 62, `${categoryTrend.category} acelerou`, `Você gastou ${Math.round(categoryTrend.increase)}% a mais que no mês anterior.`, '/transacoes'))
  const profileIncome = Number(state.profile?.income) || f.income || 0
  if (profileIncome > 0 && f.subsMonthly + f.installmentsMonthly > profileIncome * .3) results.push(insight('committed-money', 'rose', 88, 'Muito dinheiro já está comprometido', `${formatCurrency(f.subsMonthly + f.installmentsMonthly)} saem antes das escolhas do mês.`, '/parcelamentos'))
  if (state.atePagamento?.dailyRhythm != null) results.push(insight('daily-rhythm', 'cyan', 72, 'Seu ritmo até receber', `Você pode usar cerca de ${formatCurrency(state.atePagamento.dailyRhythm)} por dia.`, '/ate-pagamento'))
  if (f.overBudget?.length) results.push(insight('over-budget', 'rose', 95, `Orçamento de ${f.overBudget[0].category} estourou`, `O gasto passou do limite em ${formatCurrency(f.overBudget[0].spent - f.overBudget[0].limit)}.`, '/orcamento'))
  if (f.savingsRate >= 20) results.push(insight('savings-rate', 'emerald', 55, 'Boa taxa de poupança', `Você preservou ${Math.round(f.savingsRate)}% da renda neste mês.`, '/metas'))
  else if (f.savingsRate < 0) results.push(insight('savings-rate', 'rose', 92, 'O mês está consumindo sua reserva', `As saídas superam as entradas em ${formatCurrency(Math.abs(f.result))}.`, '/orcamento'))
  else if (f.savingsRate < 10) results.push(insight('savings-rate', 'amber', 66, 'Pouca margem para poupar', `Sua taxa de poupança está em ${Math.round(f.savingsRate)}%.`, '/orcamento'))
  if (f.reservePct >= 100) results.push(insight('reserve', 'emerald', 48, 'Reserva protegida', 'Sua meta de emergência está completa.', '/reserva'))
  else if (f.reservePct < 50) results.push(insight('reserve', 'amber', 76, 'Reserva ainda vulnerável', `Você cobre ${f.monthsCovered || 0} mês(es) essenciais.`, '/reserva'))
  if (f.subsMonthly > 0) results.push(insight('subscriptions-cost', 'violet', 42, 'Assinaturas somam no ano', `${formatCurrency(f.subsMonthly)} por mês viram ${formatCurrency(f.subsMonthly * 12)} por ano.`, '/assinaturas'))
  const highCard = (f.cardUtilization || []).find((card) => card.utilization > 80)
  if (highCard) results.push(insight('card-limit', 'rose', 90, `${highCard.name} perto do limite`, `A fatura usa ${Math.round(highCard.utilization)}% do limite disponível.`, '/cartoes'))
  if (f.positiveMonthStreak >= 3) results.push(insight('positive-streak', 'emerald', 44, 'Consistência que constrói', `Você fechou ${f.positiveMonthStreak} meses seguidos no positivo.`, '/relatorio'))
  if (f.previousExpenses > 80 && f.expenses > f.previousExpenses * 1.15) results.push(insight('expense-rise', 'amber', 69, 'As despesas subiram', `Você gastou ${Math.round(((f.expenses - f.previousExpenses) / f.previousExpenses) * 100)}% a mais que no mês anterior.`, '/transacoes'))
  const forgotten = (state.subscriptions || []).find((sub) => sub.active && sub.lastUsedDate && (now - new Date(`${sub.lastUsedDate}T12:00:00`)) / 86400000 >= 90)
  if (forgotten) results.push(insight('forgotten-subscription', 'amber', 82, `${forgotten.name} parece esquecida`, 'Sem uso há pelo menos três meses. Vale cancelar?', '/assinaturas'))
  if (profileIncome > 0 && f.liabilitiesTotal > profileIncome * 12 * .5) results.push(insight('high-debt', 'rose', 94, 'Dívidas pedem prioridade', 'O saldo de dívidas passou de metade da sua renda anual.', '/patrimonio'))
  return results
}

export function buildInsights(finance, state, now) {
  return [...new Map(evaluateInsightRules(finance, state, now).map((item) => [item.id, item])).values()].sort((a, b) => b.priority - a.priority).slice(0, 5)
}

export function situationPhrase(finance, atePagamento) {
  if (atePagamento && Number.isFinite(Number(atePagamento.dailyRhythm))) return { title: `Você pode gastar ${formatCurrency(atePagamento.dailyRhythm, { cents: false })} por dia`, detail: `${formatCurrency(atePagamento.remainingFree)} livres até o próximo recebimento.` }
  if (finance.result >= 0) return { title: `Este mês sobram ${formatCurrency(finance.result, { cents: false })}`, detail: 'Essa é a margem que pode ganhar uma função: reserva, meta ou investimento.' }
  return { title: `O mês está ${formatCurrency(Math.abs(finance.result), { cents: false })} negativo`, detail: 'Priorize os gastos flexíveis e proteja o que é essencial.' }
}
