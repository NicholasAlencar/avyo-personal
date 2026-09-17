import { expect, test } from 'vitest'
import { MAX_IMPORT_BYTES, validateImportFile } from './importFiles'

const file = (name, type, size = 100) => ({ name, type, size })

test('accepts the documented CSV, OFX and text file types', () => {
  expect(validateImportFile(file('movimentos.csv', 'text/csv'), 'csv')).toEqual({ ok: true, format: 'csv' })
  expect(validateImportFile(file('extrato.ofx', 'application/x-ofx'), 'statement')).toEqual({ ok: true, format: 'ofx' })
  expect(validateImportFile(file('extrato.txt', 'text/plain'), 'statement')).toEqual({ ok: true, format: 'text' })
  expect(validateImportFile(file('movimentos.csv', ''), 'csv')).toEqual({ ok: true, format: 'csv' })
})

test('rejects files above 2 MiB before content is read', () => {
  expect(validateImportFile(file('movimentos.csv', 'text/csv', MAX_IMPORT_BYTES + 1), 'csv')).toEqual({
    ok: false,
    error: 'O arquivo deve ter no máximo 2 MB.',
  })
})

test('rejects incompatible extensions and explicit MIME types', () => {
  expect(validateImportFile(file('planilha.exe', 'text/csv'), 'csv').ok).toBe(false)
  expect(validateImportFile(file('movimentos.csv', 'application/pdf'), 'csv').ok).toBe(false)
  expect(validateImportFile(file('extrato.csv', 'text/csv'), 'statement').ok).toBe(false)
})
