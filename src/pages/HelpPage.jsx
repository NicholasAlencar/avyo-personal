import { useId, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { learningNav, RouteNav } from '../components/avyo/RouteNav'

const faqs = [['Onde meus dados ficam?', 'Somente neste navegador, usando armazenamento local.'], ['O AVYO movimenta meu dinheiro?', 'Não. Ele organiza informações e oferece simulações educativas.'], ['Posso importar meu extrato?', 'Sim. CSV é processado localmente; OFX ou texto pode usar IA apenas com consentimento.'], ['As projeções são garantidas?', 'Não. Taxas e valores são cenários para aprendizado.'], ['A IA vê meu nome ou email?', 'Os payloads de IA usam resumos sanitizados e não enviam nome, email nem identificadores internos.']]

function FaqItem({ question, answer }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return <Card className="overflow-hidden"><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 p-5 text-left"><span className="font-heading font-semibold">{question}</span><ChevronDown size={18} className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} /></button><div id={id} hidden={!open} className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-slate-400">{answer}</div></Card>
}

export function HelpPage() {
  const [query, setQuery] = useState('')
  const items = faqs.filter((faq) => faq.join(' ').toLowerCase().includes(query.toLowerCase()))
  return <><RouteNav items={learningNav} /><PageHeader eyebrow="Aprender" title="Ajuda" subtitle="Respostas diretas para usar o AVYO com segurança." /><label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4"><Search size={18} className="text-slate-500" /><span className="sr-only">Buscar ajuda</span><input aria-label="Buscar ajuda" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque uma dúvida" className="min-h-12 flex-1 bg-transparent outline-none" /></label><div className="mt-5 space-y-3">{items.length ? items.map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />) : <Card className="p-5 text-sm text-slate-500">Nenhuma resposta encontrada. Tente termos como dados, IA, extrato ou projeções.</Card>}</div></>
}
