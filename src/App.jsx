import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/avyo/AppLayout'
import { OnboardingDialog } from './components/avyo/OnboardingDialog'
import { FinanceProvider } from './context/FinanceContext'
import { HomePage } from './pages/HomePage'

export default function App() {
  return <FinanceProvider><BrowserRouter><AppLayout><Routes><Route path="/" element={<HomePage />} /></Routes></AppLayout><OnboardingDialog /></BrowserRouter></FinanceProvider>
}
