import { NavLink } from 'react-router-dom'

export function RouteNav({ items }) {
  return <nav aria-label="Seções da área" className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1.5">{items.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/[0.09] text-cyan-200' : 'text-slate-500 hover:text-slate-200'}`}>{item.label}</NavLink>)}</nav>
}

export const movementNav = [{ label: 'Transações', to: '/movimentacoes/transacoes' }, { label: 'Cartões', to: '/movimentacoes/cartoes' }, { label: 'Parcelamentos', to: '/movimentacoes/parcelamentos' }, { label: 'Assinaturas', to: '/movimentacoes/assinaturas' }]
export const planningNav = [{ label: 'Orçamento', to: '/planejamento/orcamento' }, { label: 'Metas', to: '/planejamento/metas' }, { label: 'Reserva', to: '/reserva' }, { label: 'Até receber', to: '/ate-pagamento' }]
export const learningNav = [{ label: 'Escola', to: '/aprender/escola' }, { label: 'Calculadoras', to: '/aprender/calculadoras' }, { label: 'Ajuda', to: '/aprender/ajuda' }]
