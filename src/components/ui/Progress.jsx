import { motion, useReducedMotion } from 'framer-motion'

export function Progress({ value = 0, tone = 'cyan', label = 'Progresso' }) {
  const reduced = useReducedMotion()
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))
  const colors = { cyan: 'from-blue-500 to-cyan-400', emerald: 'from-emerald-500 to-cyan-400', amber: 'from-amber-500 to-orange-400', rose: 'from-rose-500 to-orange-400', violet: 'from-violet-500 to-fuchsia-400' }
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(safeValue)}>
      <motion.div className={`h-full rounded-full bg-gradient-to-r ${colors[tone] || colors.cyan}`} initial={{ width: reduced ? `${safeValue}%` : 0 }} animate={{ width: `${safeValue}%` }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18 }} />
    </div>
  )
}
