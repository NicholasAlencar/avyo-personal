export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

const rules = {
  csv: {
    extensions: ['csv'],
    mimeTypes: ['', 'text/csv', 'application/csv', 'text/plain'],
  },
  statement: {
    extensions: ['ofx', 'txt'],
    mimeTypes: ['', 'application/x-ofx', 'application/ofx', 'text/plain', 'application/octet-stream'],
  },
}

export function validateImportFile(file, mode) {
  if (!file) return { ok: false, error: 'Escolha um arquivo para continuar.' }
  if (Number(file.size) > MAX_IMPORT_BYTES) return { ok: false, error: 'O arquivo deve ter no máximo 2 MB.' }

  const rule = rules[mode]
  const extension = String(file.name || '').toLowerCase().split('.').pop()
  const mimeType = String(file.type || '').toLowerCase()
  if (!rule || !rule.extensions.includes(extension) || !rule.mimeTypes.includes(mimeType)) {
    return { ok: false, error: mode === 'csv' ? 'Escolha um arquivo CSV válido.' : 'Escolha um arquivo OFX ou TXT válido.' }
  }

  return { ok: true, format: extension === 'ofx' ? 'ofx' : mode === 'csv' ? 'csv' : 'text' }
}
