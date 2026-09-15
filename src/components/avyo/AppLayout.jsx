import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NavItems } from './NavItems'

function Brand() {
  return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 font-heading text-lg font-bold text-white shadow-lg shadow-blue-950/50">A</div><div><p className="font-heading text-lg font-bold tracking-wide text-white">AVYO</p><p className="-mt-1 text-[10px] uppercase tracking-[.25em] text-cyan-300">Personal</p></div></div>
}

export function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return undefined
    const close = (event) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"><div className="absolute -right-32 -top-40 size-[34rem] rounded-full bg-blue-600/15 blur-3xl" /><div className="absolute -left-48 top-1/3 size-[30rem] rounded-full bg-violet-600/10 blur-3xl" /></div>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0A1020]/80 px-4 py-6 backdrop-blur-xl lg:flex">
        <div className="px-2"><Brand /></div><div className="my-7 h-px bg-white/[0.06]" /><div className="min-h-0 flex-1 overflow-y-auto"><NavItems /></div><p className="px-2 pt-5 text-xs leading-relaxed text-slate-500">Organize. Faça sobrar.<br />Construa patrimônio.</p>
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0A1020]/85 px-4 backdrop-blur-xl lg:hidden">
        <Brand /><button className="grid size-11 place-items-center rounded-xl bg-white/[0.05] text-slate-200 focus:ring-2 focus:ring-cyan-400" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
      </header>
      {menuOpen && <div className="fixed inset-0 z-40 lg:hidden"><button className="absolute inset-0 bg-black/70" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} /><aside className="relative h-full w-72 border-r border-white/10 bg-[#0A1020] p-5 shadow-2xl"><div className="mb-7 flex items-center justify-between"><Brand /><button className="grid size-10 place-items-center rounded-xl bg-white/[0.05]" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={20} /></button></div><NavItems onNavigate={() => setMenuOpen(false)} /></aside></div>}
      <div className="lg:pl-64"><main className="mx-auto min-h-screen max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</main></div>
    </div>
  )
}
