import { useMemo, useState } from 'react'
import { RotateCcw, Send, Sparkles } from 'lucide-react'
import { buildPlannerPayload } from '../../lib/aiPayloads'
import { useAi } from '../../services/ai/AiContext'
import { localAiFallback } from '../../services/ai/LocalAiFallback'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { PlannerActions } from './PlannerActions'

export function PlannerChat({ state }) {
  const provider = useAi()
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const lastQuestion = useMemo(() => [...messages].reverse().find((message) => message.role === 'user')?.text || '', [messages])

  const ask = async (text, { replaceAssistant = false } = {}) => {
    const clean = String(text || '').trim()
    if (!clean || loading) return
    const history = replaceAssistant ? messages.filter((message, index) => !(index === messages.length - 1 && message.role === 'assistant')) : messages
    const userAlreadyPresent = replaceAssistant && history.at(-1)?.role === 'user' && history.at(-1)?.text === clean
    const nextMessages = userAlreadyPresent ? history : [...history, { role: 'user', text: clean }]
    setMessages(nextMessages)
    setQuestion('')
    setLoading(true)
    setFailed(false)
    const payload = buildPlannerPayload(state, clean, history)
    try {
      const response = await provider.answerPlanner(payload)
      setMessages([...nextMessages, { role: 'assistant', text: response.text || response.summary || 'Sem resposta.', actions: response.actions || [], mode: response.mode || 'ai' }])
    } catch {
      const response = await localAiFallback.answerPlanner(payload)
      setMessages([...nextMessages, { role: 'assistant', text: response.text, actions: response.actions || [], mode: 'local' }])
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const newSession = () => {
    setMessages([])
    setQuestion('')
    setFailed(false)
  }

  return <Card className="p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-violet-300"><Sparkles size={17} /><span className="text-xs font-semibold uppercase tracking-[.15em]">Planejador com IA</span></div><h2 className="mt-2 font-heading text-xl font-bold">Conversa desta sessão</h2><p className="mt-2 text-sm text-slate-400">A conversa fica apenas na memória desta tela. Ao recarregar ou iniciar uma nova sessão, ela desaparece.</p></div><Button variant="ghost" onClick={newSession}><RotateCcw size={15} />Nova sessão</Button></div>

    <div className="mt-6 min-h-32 space-y-3" aria-live="polite">{messages.length ? messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'ml-auto bg-cyan-400/10 text-cyan-50' : 'bg-white/[0.04] text-slate-200'}`}><div>{message.text}</div>{message.role === 'assistant' && message.mode === 'local' && <p className="mt-2 text-xs font-semibold text-amber-300">Modo local · a IA externa não respondeu.</p>}{message.role === 'assistant' && <PlannerActions actions={message.actions} />}</div>) : <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-500">Pergunte sobre orçamento, reserva, compromissos ou próximos passos. O Planejador recebe somente um resumo sanitizado.</p>}{loading && <p className="text-sm text-slate-500">Organizando os dados enviados…</p>}</div>

    {failed && <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" disabled={!lastQuestion || loading} onClick={() => ask(lastQuestion, { replaceAssistant: true })}>Tentar novamente</Button></div>}
    {!failed && messages.at(-1)?.role === 'assistant' && <Button className="mt-4" variant="ghost" disabled={!lastQuestion || loading} onClick={() => ask(lastQuestion, { replaceAssistant: true })}>Regenerar resposta</Button>}

    <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); ask(question) }}><label className="sr-only" htmlFor="planner-question">Pergunta para o Planejador</label><textarea id="planner-question" aria-label="Pergunta para o Planejador" value={question} onChange={(event) => setQuestion(event.target.value)} rows="2" maxLength="800" placeholder="Ex.: como organizar melhor este mês?" className="min-h-12 flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm outline-none focus:border-cyan-400/50" /><Button type="submit" disabled={!question.trim() || loading}><Send size={15} />Enviar</Button></form>
    <p className="mt-4 text-xs text-slate-500">Conteúdo educativo; não movimenta dinheiro, não promete retorno e não substitui orientação profissional.</p>
  </Card>
}
