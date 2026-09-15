import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BarChart3, BookOpen, BriefcaseBusiness, ChevronDown, CircleDollarSign, CreditCard, GraduationCap, Landmark, LayoutDashboard, PiggyBank, PlugZap, ReceiptText, Settings, ShieldCheck, Sparkles, Target, WalletCards } from 'lucide-react'

const navigation = [
  { label: 'Início', to: '/', icon: LayoutDashboard },
  { label: 'Movimentações', icon: WalletCards, children: [
    { label: 'Transações', to: '/transacoes', icon: ReceiptText },
    { label: 'Cartões', to: '/cartoes', icon: CreditCard },
    { label: 'Parcelamentos', to: '/parcelamentos', icon: CircleDollarSign },
    { label: 'Assinaturas', to: '/assinaturas', icon: Sparkles },
  ]},
  { label: 'Planejamento', icon: Target, children: [
    { label: 'Orçamento', to: '/orcamento', icon: BarChart3 },
    { label: 'Metas', to: '/metas', icon: Target },
    { label: 'Reserva', to: '/reserva', icon: ShieldCheck },
    { label: 'Até receber', to: '/ate-pagamento', icon: PiggyBank },
  ]},
  { label: 'Investimentos', to: '/investimentos', icon: Landmark },
  { label: 'Patrimônio', to: '/patrimonio', icon: BriefcaseBusiness },
  { label: 'Meu Planejador', to: '/planejador', icon: Sparkles },
  { label: 'AVYO Connect', to: '/connect', icon: PlugZap },
  { label: 'Aprender', icon: GraduationCap, children: [
    { label: 'Escola', to: '/escola', icon: BookOpen },
    { label: 'Calculadoras', to: '/calculadoras', icon: BarChart3 },
    { label: 'Ajuda', to: '/ajuda', icon: BookOpen },
    { label: 'Relatório mensal', to: '/relatorio', icon: ReceiptText },
  ]},
  { label: 'Configurações', to: '/configuracoes', icon: Settings },
]

function ItemLink({ item, onNavigate }) {
  const Icon = item.icon
  return (
    <NavLink to={item.to} onClick={onNavigate} className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${isActive ? 'bg-gradient-to-r from-blue-600/25 to-cyan-500/10 text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`} end={item.to === '/'}>
      {({ isActive }) => <><Icon size={18} className={isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'} /><span>{item.label}</span></>}
    </NavLink>
  )
}

export function NavItems({ onNavigate }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(() => Object.fromEntries(navigation.filter((item) => item.children).map((item) => [item.label, item.children.some((child) => child.to === pathname)])))
  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {navigation.map((item) => {
        if (!item.children) return <ItemLink key={item.label} item={item} onNavigate={onNavigate} />
        const activeGroup = item.children.some((child) => pathname === child.to)
        const Icon = item.icon
        const expanded = open[item.label]
        return <div key={item.label}>
          <button className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition hover:bg-white/[0.04] ${activeGroup ? 'text-white' : 'text-slate-400'}`} aria-expanded={expanded} onClick={() => setOpen((value) => ({ ...value, [item.label]: !expanded }))}>
            <Icon size={18} className={activeGroup ? 'text-cyan-300' : 'text-slate-500'} />
            <span className="flex-1">{item.label}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <div className={`ml-4 overflow-hidden border-l border-white/[0.06] pl-3 transition-all duration-200 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {item.children.map((child) => <ItemLink key={child.to} item={child} onNavigate={onNavigate} />)}
          </div>
        </div>
      })}
    </nav>
  )
}
