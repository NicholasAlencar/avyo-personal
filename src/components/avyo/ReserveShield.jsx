import { ShieldCheck } from 'lucide-react'
import { Progress } from '../ui/Progress'
import { formatCurrency } from '../../lib/format'

export function ReserveShield({ current, target, monthsCovered }) { const pct = target > 0 ? current / target * 100 : 0; return <div className="text-center"><div className="relative mx-auto grid size-36 place-items-center"><div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl" /><ShieldCheck size={112} strokeWidth={1.15} className="relative text-cyan-300" /><strong className="absolute font-heading text-2xl">{monthsCovered}</strong></div><h2 className="mt-3 font-heading text-2xl font-bold">{monthsCovered} meses protegidos</h2><p className="mt-2 text-sm text-slate-400">{formatCurrency(current)} de {formatCurrency(target)}</p><div className="mx-auto mt-5 max-w-md"><Progress value={pct} tone="emerald" label="Progresso da reserva" /></div></div> }
