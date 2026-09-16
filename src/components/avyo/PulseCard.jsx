import { ArrowRight, Activity } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'

export function PulseCard({ pulse }) {
  const reduceMotion = useReducedMotion()
  const { score, label, cta } = pulse

  return <Card className="overflow-hidden p-5">
    <div className="flex items-start gap-5">
      <motion.div
        className="relative grid size-24 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/10"
        initial={reduceMotion ? false : { scale: 0.92, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.35 }}
      >
        <div className="absolute inset-1 rounded-full border border-cyan-300/20" />
        <div className="absolute inset-3 rounded-full border border-blue-400/10" />
        <strong className="font-heading text-2xl text-cyan-200">{score}</strong>
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-cyan-300"><Activity size={14} />Saúde financeira</div>
        <h2 className="mt-2 font-heading text-xl font-semibold">AVYO Pulse — {score}/100</h2>
        <p className="mt-1 text-sm font-medium text-slate-200">{label}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">Um termômetro simples do seu fluxo, reserva, cartões e obrigações. Ele orienta o próximo ponto de atenção sem transformar sua vida financeira em uma nota.</p>
        <Link to={cta.to} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">{cta.label} <ArrowRight size={15} /></Link>
      </div>
    </div>
  </Card>
}
