import { expect, test } from 'vitest'
import { inferColumnMap, normalizeImportedRows, parseCsv, suggestCategory } from './csv'

test('parses quoted commas, decimal commas and semicolon files', () => {
  const rows = parseCsv('\uFEFFdata;descricao;valor\n15/09/2026;"Mercado, bairro";-123,45')
  const map = inferColumnMap(Object.keys(rows[0]))
  expect(rows[0].descricao).toBe('Mercado, bairro')
  expect(normalizeImportedRows(rows, map)[0]).toMatchObject({ type: 'expense', amount: 123.45, date: '2026-09-15' })
})

test('suggests a local category from the description', () => {
  expect(suggestCategory('Supermercado Central')).toBe('Alimentação')
  expect(suggestCategory('Uber corrida')).toBe('Transporte')
  expect(suggestCategory('algo desconhecido')).toBe('Outros')
})

test('rejects CSV input above the 10,000-row limit', () => {
  const text = ['data,descricao,valor', ...Array.from({ length: 10001 }, () => '2026-09-17,item,-1')].join('\n')
  expect(() => parseCsv(text)).toThrow(/10\.000 linhas/i)
})
