import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../lib/format'

export function WealthProjectionChart({ points }) {
  const hasContributed = points.some((point) => Number(point.contributed || 0) > 0)
  return (
    <div className="h-72 w-full" aria-label="Gráfico da evolução patrimonial">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points}>
          <defs>
            <linearGradient id="wealth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".65" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient>
            <linearGradient id="contributed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".22" /><stop offset="100%" stopColor="#22d3ee" stopOpacity="0" /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ background: '#10192c', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12 }} formatter={(value, name) => [formatCurrency(value), name === 'contributed' ? 'Aportes' : 'Patrimônio']} />
          {hasContributed && <Area type="monotone" dataKey="contributed" stroke="#22d3ee" strokeWidth={2} fill="url(#contributed)" />}
          <Area type="monotone" dataKey="balance" stroke="#a78bfa" strokeWidth={3} fill="url(#wealth)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
