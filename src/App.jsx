import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/avyo/AppLayout'
import { OnboardingDialog } from './components/avyo/OnboardingDialog'
import { ScrollToTop } from './components/avyo/ScrollToTop'
import { ToastProvider } from './components/ui/ToastProvider'
import { FinanceProvider } from './context/FinanceContext'

const page = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })))
const HomePage = page(() => import('./pages/HomePage'), 'HomePage')
const TransactionsPage = page(() => import('./pages/TransactionsPage'), 'TransactionsPage')
const CardsPage = page(() => import('./pages/CardsPage'), 'CardsPage')
const InstallmentsPage = page(() => import('./pages/InstallmentsPage'), 'InstallmentsPage')
const SubscriptionsPage = page(() => import('./pages/SubscriptionsPage'), 'SubscriptionsPage')
const BudgetsPage = page(() => import('./pages/BudgetsPage'), 'BudgetsPage')
const GoalsPage = page(() => import('./pages/GoalsPage'), 'GoalsPage')
const EmergencyReservePage = page(() => import('./pages/EmergencyReservePage'), 'EmergencyReservePage')
const UntilPaydayPage = page(() => import('./pages/UntilPaydayPage'), 'UntilPaydayPage')
const InvestmentsPage = page(() => import('./pages/InvestmentsPage'), 'InvestmentsPage')
const NetWorthPage = page(() => import('./pages/NetWorthPage'), 'NetWorthPage')
const WealthCalculatorPage = page(() => import('./pages/WealthCalculatorPage'), 'WealthCalculatorPage')
const PlannerPage = page(() => import('./pages/PlannerPage'), 'PlannerPage')
const ConnectPage = page(() => import('./pages/ConnectPage'), 'ConnectPage')
const SchoolPage = page(() => import('./pages/SchoolPage'), 'SchoolPage')
const CalculatorsPage = page(() => import('./pages/CalculatorsPage'), 'CalculatorsPage')
const HelpPage = page(() => import('./pages/HelpPage'), 'HelpPage')
const ReportPage = page(() => import('./pages/ReportPage'), 'ReportPage')
const SettingsPage = page(() => import('./pages/SettingsPage'), 'SettingsPage')
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage')

export function AppRoutes() {
  return <Suspense fallback={<div role="status" className="avyo-card p-6 text-sm text-slate-400">Carregando sua visão financeira…</div>}><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/movimentacoes/transacoes" element={<TransactionsPage />} /><Route path="/movimentacoes/cartoes" element={<CardsPage />} /><Route path="/movimentacoes/parcelamentos" element={<InstallmentsPage />} /><Route path="/movimentacoes/assinaturas" element={<SubscriptionsPage />} />
    <Route path="/planejamento/orcamento" element={<BudgetsPage />} /><Route path="/planejamento/metas" element={<GoalsPage />} /><Route path="/reserva" element={<EmergencyReservePage />} /><Route path="/ate-pagamento" element={<UntilPaydayPage />} />
    <Route path="/investimentos" element={<InvestmentsPage />} /><Route path="/patrimonio" element={<NetWorthPage />} /><Route path="/patrimonio/calculadora" element={<WealthCalculatorPage />} />
    <Route path="/planejador" element={<PlannerPage />} /><Route path="/connect" element={<ConnectPage />} /><Route path="/aprender/escola" element={<SchoolPage />} /><Route path="/aprender/calculadoras" element={<CalculatorsPage />} /><Route path="/aprender/ajuda" element={<HelpPage />} /><Route path="/relatorio" element={<ReportPage />} /><Route path="/configuracoes" element={<SettingsPage />} />
    <Route path="/transacoes" element={<Navigate replace to="/movimentacoes/transacoes" />} /><Route path="/cartoes" element={<Navigate replace to="/movimentacoes/cartoes" />} /><Route path="/parcelamentos" element={<Navigate replace to="/movimentacoes/parcelamentos" />} /><Route path="/assinaturas" element={<Navigate replace to="/movimentacoes/assinaturas" />} />
    <Route path="/orcamento" element={<Navigate replace to="/planejamento/orcamento" />} /><Route path="/metas" element={<Navigate replace to="/planejamento/metas" />} />
    <Route path="/escola" element={<Navigate replace to="/aprender/escola" />} /><Route path="/calculadoras" element={<Navigate replace to="/aprender/calculadoras" />} /><Route path="/ajuda" element={<Navigate replace to="/aprender/ajuda" />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense>
}

export default function App() {
  return <FinanceProvider><ToastProvider><BrowserRouter><ScrollToTop /><AppLayout><AppRoutes /></AppLayout><OnboardingDialog /></BrowserRouter></ToastProvider></FinanceProvider>
}
