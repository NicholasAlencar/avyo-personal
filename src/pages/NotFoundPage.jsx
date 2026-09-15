import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
export function NotFoundPage() { return <Card className="mx-auto max-w-xl p-8 text-center"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-300">Erro 404</p><h1 className="mt-3 font-heading text-3xl font-bold">Página não encontrada</h1><p className="mt-3 text-sm text-slate-400">Este caminho não existe ou foi movido. Seus dados continuam seguros neste navegador.</p><Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200"><ArrowLeft size={16} />Voltar ao início</Link></Card> }
