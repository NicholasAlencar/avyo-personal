import { Card } from '../ui/Card'

export function PulseCard({ score }) {
  const label = score >= 75 ? 'Em boa direção' : score >= 50 ? 'Ganhando equilíbrio' : 'Pede atenção'
  return <Card className="flex items-center gap-5 p-5"><div className="relative grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/10"><div className="absolute inset-1 rounded-full border border-cyan-300/20 motion-safe:animate-pulse" /><strong className="font-heading text-2xl text-cyan-200">{score}</strong></div><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Saúde financeira</p><h3 className="mt-1 font-heading text-lg font-semibold">{label}</h3><p className="mt-1 text-sm text-slate-400">Um termômetro simples do seu fluxo, reserva e compromissos.</p></div></Card>
}
