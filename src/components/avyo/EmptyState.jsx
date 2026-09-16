import { Inbox } from 'lucide-react'

export function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return <section className="avyo-card flex min-h-56 flex-col items-center justify-center p-8 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300" aria-hidden="true"><Icon size={22} /></span><h2 className="mt-4 font-heading text-lg font-semibold text-white">{title}</h2>{description && <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>}{action && <div className="mt-5">{action}</div>}</section>
}
