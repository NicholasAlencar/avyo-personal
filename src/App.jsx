import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/avyo/AppLayout'
import { OnboardingDialog } from './components/avyo/OnboardingDialog'
import { FinanceProvider } from './context/FinanceContext'
import { HomePage } from './pages/HomePage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CardsPage } from './pages/CardsPage'
import { InstallmentsPage } from './pages/InstallmentsPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'

export default function App() {
  return <FinanceProvider><BrowserRouter><AppLayout><Routes><Route path="/" element={<HomePage />} /><Route path="/transacoes" element={<TransactionsPage />} /><Route path="/cartoes" element={<CardsPage />} /><Route path="/parcelamentos" element={<InstallmentsPage />} /><Route path="/assinaturas" element={<SubscriptionsPage />} /></Routes></AppLayout><OnboardingDialog /></BrowserRouter></FinanceProvider>
}
