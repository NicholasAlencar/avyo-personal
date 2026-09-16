import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { learningNav, RouteNav } from '../components/avyo/RouteNav'

const faqs = [
  ['Onde meus dados ficam?', 'Somente neste navegador, usando armazenamento local.'],
  ['O AVYO movimenta meu dinheiro?', 'Não. Ele organiza informações e oferece simulações educativas.'],
  ['Posso importar meu extrato?', 'Sim, pela página Transações. CSV é processado localmente; formatos que usam IA só são enviados depois do consentimento.'],
  ['As projeções são garantidas?', 'Não. Taxas e valores são cenários para aprendizado e não representam promessa de retorno.'],
  ['Quando o Base44 é usado?', 'Somente nas três funções opcionais de IA previstas pelo AVYO e apenas depois do consentimento nas configurações.'],
]

export function HelpPage() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(null)
  const items = faqs.filter((faq) => faq.join(' ').toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <>
      <RouteNav items={learningNav} />
      <PageHeader eyebrow="Aprender" title="Ajuda" subtitle="Respostas diretas para usar o AVYO com segurança." />
      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4">
        <Search size={18} className="text-slate-500" />
        <span className="sr-only">Buscar ajuda</span>
        <input aria-label="Buscar ajuda" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque uma dúvida" className="min-h-12 flex-1 bg-transparent outline-none" />
      </label>

      <div className="mt-5 space-y-3">
        {items.map(([question, answer], index) => {
          const id = `faq-${index}`
          const expanded = open === question
          return (
            <Card key={question} className="overflow-hidden">
              <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setOpen(expanded ? null : question)} className="flex min-h-14 w-full items-center justify-between gap-4 p-5 text-left">
                <span className="font-heading font-semibold">{question}</span>
                <ChevronDown size={18} className={`shrink-0 text-slate-500 transition ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && <div id={id} className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-slate-400">{answer}</div>}
            </Card>
          )
        })}
        {!items.length && <Card className="p-5 text-sm text-slate-400">Nenhuma resposta encontrada. Tente uma palavra diferente.</Card>}
      </div>
    </>
  )
}
