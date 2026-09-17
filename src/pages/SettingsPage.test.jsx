import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { createInitialState } from '../data/seed'
import { CORRUPT_BACKUP_KEY, STORAGE_KEY } from '../data/storage'
import { SettingsPage } from './SettingsPage'

function storage() {
  const values = new Map([[STORAGE_KEY, JSON.stringify(createInitialState())]])
  return {
    api: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
    },
    values,
  }
}

function renderPage(local = storage()) {
  return { local, ...render(<FinanceProvider storage={local.api}><MemoryRouter><SettingsPage /></MemoryRouter></FinanceProvider>) }
}

test('exposes local-data notice, blocks remote AI and has no logout', () => {
  renderPage()

  expect(screen.getByText(/dados somente neste navegador/i)).toBeVisible()
  expect(screen.getByText(/versão de validação · 0\.2/i)).toBeVisible()
  expect(screen.queryByRole('button', { name: /sair|logout/i })).not.toBeInTheDocument()

  expect(screen.getByText(/chamadas externas bloqueadas nesta versão/i)).toBeVisible()
  expect(screen.queryByRole('checkbox', { name: /habilitar ia|aceito o envio/i })).not.toBeInTheDocument()
})

test('edits protection, investment and business profile fields locally', async () => {
  const user = userEvent.setup()
  const { local } = renderPage()

  await user.clear(screen.getByLabelText('Custo essencial'))
  await user.type(screen.getByLabelText('Custo essencial'), '4200')
  await user.clear(screen.getByLabelText('Meta mensal de investimentos'))
  await user.type(screen.getByLabelText('Meta mensal de investimentos'), '1500')
  await user.clear(screen.getByLabelText('Patrimônio líquido da empresa'))
  await user.type(screen.getByLabelText('Patrimônio líquido da empresa'), '95000')
  await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

  const saved = JSON.parse(local.values.get(STORAGE_KEY))
  expect(saved.profile.essentialCost).toBe(4200)
  expect(saved.profile.monthlyInvestmentGoal).toBe(1500)
  expect(saved.profile.businessNetWorth).toBe(95000)
  expect(screen.getByText(/perfil de investidor/i)).toBeVisible()
})

test('requires confirmation before clearing local data', async () => {
  const user = userEvent.setup()
  const local = storage()
  local.api.setItem(CORRUPT_BACKUP_KEY, 'old financial data')
  renderPage(local)
  await user.click(screen.getByRole('button', { name: /apagar tudo/i }))
  expect(screen.getByRole('dialog', { name: /apagar todos os dados/i })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /apagar meus dados/i }))
  expect(JSON.parse(local.values.get(STORAGE_KEY)).profile.onboarded).toBe(false)
  expect(local.values.has(CORRUPT_BACKUP_KEY)).toBe(false)
})
