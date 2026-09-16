import { ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button'

export function AiDisclosure({ accepted, onAccept }) {
  return <aside className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.07] p-4" aria-label="Privacidade da inteligência artificial"><div className="flex items-start gap-3"><span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300" aria-hidden="true"><ShieldCheck size={18} /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-violet-100">Este recurso usa Base44</p><p className="mt-1 text-sm leading-relaxed text-slate-300">Dados financeiros resumidos e necessários para esta solicitação serão enviados ao Base44. O AVYO não envia nomes, email ou identificadores internos e não salva esses dados remotamente.</p>{accepted ? <p className="mt-3 text-xs font-semibold text-emerald-300">Consentimento registrado.</p> : <Button className="mt-4" variant="secondary" onClick={onAccept}>Entendi e aceito</Button>}</div></div></aside>
}
