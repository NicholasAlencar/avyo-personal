import { clsx } from 'clsx'

const variants = {
  primary: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-950/30 hover:brightness-110',
  secondary: 'border border-white/10 bg-white/[0.05] text-slate-100 hover:bg-white/[0.09]',
  ghost: 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20',
}

export function Button({ variant = 'primary', className, type = 'button', ...props }) {
  return <button type={type} className={clsx('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)} {...props} />
}
