function splitLine(line, delimiter) {
  const cells = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === delimiter && !quoted) { cells.push(value.trim()); value = '' }
    else value += char
  }
  cells.push(value.trim())
  return cells
}

function separatorFor(header) {
  const counts = { ';': 0, ',': 0, '\t': 0 }
  let quoted = false
  for (const char of header) { if (char === '"') quoted = !quoted; else if (!quoted && char in counts) counts[char] += 1 }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

export function parseCsv(text) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return []
  if (lines.length - 1 > MAX_CSV_LINES) throw new Error('O CSV deve ter no máximo 10.000 linhas.')
  const delimiter = separatorFor(lines[0])
  const headers = splitLine(lines[0], delimiter).map((item) => item.toLowerCase().trim())
  return lines.slice(1).map((line, lineIndex) => {
    const values = splitLine(line, delimiter)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']).concat([['_line', lineIndex + 2]]))
  })
}

export function inferColumnMap(headers) {
  const find = (...terms) => headers.find((header) => terms.some((term) => header.toLowerCase().includes(term)))
  return { date: find('data', 'date'), description: find('descr', 'hist', 'memo'), amount: find('valor', 'amount'), type: find('tipo', 'type'), category: find('categoria', 'category') }
}

function parseAmount(value) {
  const text = String(value || '').replace(/R\$/gi, '').replace(/\s/g, '')
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text
  return Number(normalized)
}

function parseDate(value) {
  const text = String(value || '').trim()
  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (br) return `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`
  const iso = text.match(/^\d{4}-\d{2}-\d{2}/)
  return iso ? iso[0] : ''
}

export function suggestCategory(description) {
  const text = String(description || '').toLowerCase()
  const rules = [
    ['Alimentação', /mercado|supermerc|restaurante|ifood|padaria|café/], ['Transporte', /uber|99|posto|gasolina|ônibus|metro/],
    ['Moradia', /aluguel|condomínio|energia|luz|água/], ['Saúde', /farmácia|médic|academia|saúde/],
    ['Educação', /livro|curso|escola|faculdade/], ['Lazer', /cinema|show|viagem|jogo/], ['Renda', /salário|salario|pagamento/],
  ]
  return rules.find(([, regex]) => regex.test(text))?.[0] || 'Outros'
}

export function normalizeImportedRows(rows, map) {
  return rows.map((row) => {
    const rawAmount = parseAmount(row[map.amount])
    const explicitType = String(row[map.type] || '').toLowerCase()
    const description = row[map.description] || 'Movimentação importada'
    if (!Number.isFinite(rawAmount) || !parseDate(row[map.date])) return { error: `Linha ${row._line}: data ou valor inválido`, line: row._line }
    return { date: parseDate(row[map.date]), description, amount: Math.abs(rawAmount), type: explicitType.includes('rece') || explicitType.includes('income') || rawAmount > 0 ? 'income' : 'expense', category: row[map.category] || suggestCategory(description), recurring: false }
  })
}
export const MAX_CSV_LINES = 10000
