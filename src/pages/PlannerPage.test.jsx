import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { PlannerPage } from './PlannerPage'
const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
test('organizes financial signals into an actionable timeline', () => { render(<FinanceProvider storage={storage()}><MemoryRouter><PlannerPage /></MemoryRouter></FinanceProvider>); expect(screen.getByRole('heading', { name: /seu plano de ação/i })).toBeVisible(); expect(screen.getByText('Agora')).toBeVisible(); expect(screen.getByText('Neste mês')).toBeVisible(); expect(screen.getByText('Depois')).toBeVisible() })
