import { useState } from 'react'
import { BookOpen, Check } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { Card } from '../components/ui/Card'
import { LessonDialog } from '../components/avyo/LessonDialog'
import { PageHeader } from '../components/avyo/PageHeader'
import { learningNav, RouteNav } from '../components/avyo/RouteNav'
const lessons = [
  { id: 'primeiros-passos', title: 'Seu dinheiro precisa de destinos', minutes: 4, content: ['Organizar não é cortar tudo. É decidir o que cada parte da renda precisa fazer.', 'Comece separando essenciais, escolhas do mês e futuro.'] },
  { id: 'reserva', title: 'Reserva antes da pressa', minutes: 5, content: ['A reserva existe para comprar tempo quando algo inesperado acontece.', 'Ela precisa estar acessível e não depende de retornos altos.'] },
  { id: 'cartao', title: 'Cartão não é renda extra', minutes: 4, content: ['O limite é uma ferramenta de pagamento, não dinheiro novo.', 'Compare a fatura com a renda antes de assumir parcelas.'] },
  { id: 'juros', title: 'Juros compostos sem mistério', minutes: 6, content: ['Rendimentos passam a render também. Tempo e consistência importam mais que pressa.', 'Simulações ajudam a visualizar, mas não garantem resultados.'] },
  { id: 'metas', title: 'Metas que cabem no mês', minutes: 5, content: ['Divida o valor que falta pelo tempo disponível.', 'Se o aporte não cabe, ajuste prazo, valor ou prioridade.'] },
  { id: 'diversificacao', title: 'Diversificar é distribuir riscos', minutes: 6, content: ['Ativos diferentes reagem de maneiras diferentes.', 'Uma carteira coerente respeita objetivo, prazo e tolerância a oscilações.'] },
]
export function SchoolPage() { const { state, updateProfile } = useFinanceStore(); const [active, setActive] = useState(null); const done = state.profile.completedLessons || []; return <><RouteNav items={learningNav} /><PageHeader eyebrow="Aprender" title="Escola AVYO" subtitle="Lições curtas para tomar decisões com mais calma e contexto." /><div className="grid gap-4 md:grid-cols-2">{lessons.map((lesson) => <button key={lesson.id} aria-label={`${lesson.title} · ${lesson.minutes} minutos · ${done.includes(lesson.id) ? 'Concluída' : 'Começar'}`} onClick={() => setActive(lesson)} className="text-left"><Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:border-white/10"><div className="flex items-start gap-4"><div className="grid size-11 place-items-center rounded-xl bg-violet-400/10 text-violet-300">{done.includes(lesson.id) ? <Check size={18} /> : <BookOpen size={18} />}</div><div><h2 className="font-heading text-lg font-semibold">{lesson.title}</h2><p className="mt-1 text-xs text-slate-500">{lesson.minutes} minutos · {done.includes(lesson.id) ? 'Concluída' : 'Começar'}</p></div></div></Card></button>)}</div><LessonDialog lesson={active} onClose={() => setActive(null)} onComplete={(id) => updateProfile({ completedLessons: [...new Set([...done, id])] })} /></> }
