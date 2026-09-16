import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { SettingsPage } from './SettingsPage'

const storage = () => { const m = new Map(); return { api: { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }, values: m } }

test('shows local profile, protection, investment and Base44 settings without logout', async () => {
  const user = userEvent.setup()
  const local = storage()
  render(<FinanceProvider storage={local.api}><MemoryRouter><SettingsPage /></MemoryRouter></FinanceProvider>)
  expect(screen.getByLabelText('Avatar do perfil')).toBeVisible()
  expect(screen.getByText(/proteção atual/i)).toBeVisible()
  expect(screen.getByText(/perfil de investimento/i)).toBeVisible()
  expect(screen.getByText(/dados ficam neste navegador/i)).toBeVisible()
  expect(screen.queryByRole('button', { name: /sair|logout/i })).not.toBeInTheDocument()
  expect(screen.getByText('Versão de validação · 0.2')).toBeVisible()

  const ai = screen.getByRole('checkbox', { name: /permitir recursos de ia base44/i })
  await user.click(ai)
  expect(JSON.parse(local.values.get('avyo-personal:v1')).settings.aiEnabled).toBe(true)
})

test('requires confirmation before clearing local data', async () => {
  const user = userEvent.setup()
  const local = storage()
  render(<FinanceProvider storage={local.api}><MemoryRouter><SettingsPage /></MemoryRouter></FinanceProvider>)
  await user.click(screen.getByRole('button', { name: /apagar tudo/i }))
  expect(screen.getByRole('dialog', { name: /apagar todos os dados/i })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /apagar meus dados/i }))
  expect(JSON.parse(local.values.get('avyo-personal:v1')).profile.onboarded).toBe(false)
})
