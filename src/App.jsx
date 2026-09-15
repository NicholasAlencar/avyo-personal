import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
    <Route path="/transacoes" element={<TransactionsPage />} /><Route path="/cartoes" element={<CardsPage />} /><Route path="/parcelamentos" element={<InstallmentsPage />} /><Route path="/assinaturas" element={<SubscriptionsPage />} />
    <Route path="/orcamento" element={<BudgetsPage />} /><Route path="/metas" element={<GoalsPage />} /><Route path="/reserva" element={<EmergencyReservePage />} /><Route path="/ate-pagamento" element={<UntilPaydayPage />} />
    <Route path="/investimentos" element={<InvestmentsPage />} /><Route path="/patrimonio" element={<NetWorthPage />} /><Route path="/patrimonio/calculadora" element={<WealthCalculatorPage />} />
    <Route path="/planejador" element={<PlannerPage />} /><Route path="/connect" element={<ConnectPage />} /><Route path="/escola" element={<SchoolPage />} /><Route path="/calculadoras" element={<CalculatorsPage />} /><Route path="/ajuda" element={<HelpPage />} /><Route path="/relatorio" element={<ReportPage />} /><Route path="/configuracoes" element={<SettingsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense>
}

export default function App() {
  return <FinanceProvider><ToastProvider><BrowserRouter><ScrollToTop /><AppLayout><AppRoutes /></AppLayout><OnboardingDialog /></BrowserRouter></ToastProvider></FinanceProvider>
}
