import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { FinanceProvider } from '../context/FinanceContext'
import { ReportPage } from './ReportPage'
const storage = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) } }
test('renders a local monthly report with its three sections', () => { render(<FinanceProvider storage={storage()}><MemoryRouter><ReportPage /></MemoryRouter></FinanceProvider>); expect(screen.getByText('Resumo')).toBeVisible(); expect(screen.getByText('Pontos de atenção')).toBeVisible(); expect(screen.getByText('Próximos passos')).toBeVisible(); expect(screen.getByRole('button', { name: /imprimir/i })).toBeVisible() })
