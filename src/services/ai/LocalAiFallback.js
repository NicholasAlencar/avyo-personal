import { inferColumnMap, normalizeImportedRows, parseCsv } from '../../lib/csv'

function localPlannerText(summary) {
  if (summary.remainder < 0) return 'As despesas estão acima das entradas. Comece pelos gastos flexíveis e compromissos recorrentes, preservando o essencial.'
  if (summary.reserve < summary.expenses) return 'Há margem positiva, e fortalecer a reserva pode aumentar sua proteção antes de assumir novos compromissos.'
  return 'Seu mês tem margem positiva. Dê uma função clara à sobra entre proteção, metas e investimentos, no seu ritmo.'
}

export const localAiFallback = {
  async answerPlanner({ summary = {} }) {
    return { mode: 'local', text: localPlannerText(summary), facts: [], actions: [] }
  },

  async generateMonthlyReport({ totals = {}, insights = [] }) {
    const result = Number(totals.result || 0)
    return {
      mode: 'local',
      summary: result >= 0 ? 'O mês terminou com saldo positivo.' : 'As despesas ficaram acima das entradas neste mês.',
      attention: insights.slice(0, 3),
      nextSteps: result >= 0 ? ['Defina um destino para a sobra.'] : ['Revise os gastos flexíveis.'],
    }
  },

  async parseStatement({ text = '' }) {
    const rawRows = parseCsv(text)
    const headers = Object.keys(rawRows[0] || {}).filter((key) => key !== '_line')
    const normalized = normalizeImportedRows(rawRows, inferColumnMap(headers))
    return {
      mode: 'local',
      rows: normalized.filter((row) => !row.error),
      warnings: normalized.filter((row) => row.error).map((row) => row.error),
    }
  },
}
