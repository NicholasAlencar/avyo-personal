import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/avyo/AppLayout'
import { OnboardingDialog } from './components/avyo/OnboardingDialog'
import { FinanceProvider } from './context/FinanceContext'
import { HomePage } from './pages/HomePage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CardsPage } from './pages/CardsPage'
import { InstallmentsPage } from './pages/InstallmentsPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { GoalsPage } from './pages/GoalsPage'
import { EmergencyReservePage } from './pages/EmergencyReservePage'
import { UntilPaydayPage } from './pages/UntilPaydayPage'
import { InvestmentsPage } from './pages/InvestmentsPage'
import { NetWorthPage } from './pages/NetWorthPage'
import { WealthCalculatorPage } from './pages/WealthCalculatorPage'

export default function App() {
  return <FinanceProvider><BrowserRouter><AppLayout><Routes><Route path="/" element={<HomePage />} /><Route path="/transacoes" element={<TransactionsPage />} /><Route path="/cartoes" element={<CardsPage />} /><Route path="/parcelamentos" element={<InstallmentsPage />} /><Route path="/assinaturas" element={<SubscriptionsPage />} /><Route path="/orcamento" element={<BudgetsPage />} /><Route path="/metas" element={<GoalsPage />} /><Route path="/reserva" element={<EmergencyReservePage />} /><Route path="/ate-pagamento" element={<UntilPaydayPage />} /><Route path="/investimentos" element={<InvestmentsPage />} /><Route path="/patrimonio" element={<NetWorthPage />} /><Route path="/patrimonio/calculadora" element={<WealthCalculatorPage />} /></Routes></AppLayout><OnboardingDialog /></BrowserRouter></FinanceProvider>
}
