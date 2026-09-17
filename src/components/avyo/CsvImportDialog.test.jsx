import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { FinanceProvider } from '../../context/FinanceContext'
import { MAX_IMPORT_BYTES } from '../../lib/importFiles'
import { CsvImportDialog } from './CsvImportDialog'

const memoryStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

test('rejects an oversized CSV before reading its contents', async () => {
  const user = userEvent.setup()
  render(<FinanceProvider storage={memoryStorage()}><CsvImportDialog open onClose={vi.fn()} onImport={vi.fn()} /></FinanceProvider>)
  const file = new File(['small'], 'movimentos.csv', { type: 'text/csv' })
  Object.defineProperty(file, 'size', { value: MAX_IMPORT_BYTES + 1 })
  const read = vi.fn()
  Object.defineProperty(file, 'text', { value: read })

  await user.upload(screen.getByLabelText(/escolha seu arquivo csv/i), file)

  expect(await screen.findByRole('alert')).toHaveTextContent('O arquivo deve ter no máximo 2 MB.')
  expect(read).not.toHaveBeenCalled()
})
