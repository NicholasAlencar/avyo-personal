export function PageHeader({ eyebrow, title, subtitle, action }) {
  return <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">{eyebrow}</p>}<h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>{subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">{subtitle}</p>}</div>{action}</header>
}
