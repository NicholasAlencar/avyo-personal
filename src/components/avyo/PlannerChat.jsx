import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { createId } from '../../data/schema'
import { buildPlannerPayload } from '../../lib/aiPayloads'
import { useAi } from '../../services/ai/AiContext'
import { localAiFallback } from '../../services/ai/LocalAiFallback'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { PlannerMessage } from './PlannerMessage'

const suggestions = ['Como organizar o mês?', 'O que priorizo agora?', 'Tenho espaço para investir?', 'Como fortalecer minha reserva?']

export function PlannerChat({ state }) {
  const ai = useAi()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('idle')
  const endRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const aiAllowed = state.settings?.aiEnabled === true && state.settings?.aiDisclosureAccepted === true

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })
  }, [messages, status, reducedMotion])

  const send = async (forcedQuestion) => {
    const question = String(forcedQuestion ?? draft).trim()
    if (!question || status === 'loading') return

    const userMessage = { id: createId('message'), role: 'user', text: question }
    const history = [...messages, userMessage]
    setMessages(history)
    setDraft('')
    setStatus('loading')
    const payload = buildPlannerPayload(state, question, messages)

    try {
      let reply
      if (aiAllowed) {
        const controller = new AbortController()
        try {
          reply = await ai.answerPlanner(payload, { signal: controller.signal })
          reply = { ...reply, mode: reply?.mode || 'base44' }
        } catch {
          reply = await localAiFallback.answerPlanner(payload)
        }
      } else {
        reply = await localAiFallback.answerPlanner(payload)
      }
      setMessages((items) => [...items, {
        id: createId('message'),
        role: 'assistant',
        text: reply?.text || 'Posso ajudar a organizar os próximos passos com os dados disponíveis neste dispositivo.',
        mode: reply?.mode || 'local',
        actions: reply?.actions || [],
      }])
    } finally {
      setStatus('idle')
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/[0.06] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="font-heading text-xl font-semibold">Converse com o AVYO</h2><p className="mt-1 text-sm text-slate-400">A conversa desta tela não é salva. {aiAllowed ? 'IA Base44 autorizada para contexto financeiro resumido.' : 'O modo local está ativo; nada é enviado.'}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${aiAllowed ? 'bg-cyan-400/10 text-cyan-200' : 'bg-amber-400/10 text-amber-200'}`}>{aiAllowed ? 'IA opcional ativa' : '100% local'}</span>
        </div>
      </div>

      <div className="max-h-[52vh] min-h-80 space-y-4 overflow-y-auto p-5" aria-live="polite" aria-label="Conversa com o planejador">
        {messages.length === 0 && (
          <div className="grid min-h-56 place-items-center text-center">
            <div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Sparkles size={20} /></div><h3 className="mt-4 font-heading text-lg font-semibold">Comece por uma dúvida real do seu mês</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">O AVYO recebe apenas agregados financeiros e o texto que você decidir enviar.</p></div>
          </div>
        )}
        {messages.map((message) => <PlannerMessage key={message.id} message={message} />)}
        {status === 'loading' && <div role="status" className="text-sm text-slate-500">AVYO está organizando uma resposta…</div>}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-white">{suggestion}</button>)}</div>
        <div className="flex items-end gap-2">
          <label className="flex-1 text-xs text-slate-500">Pergunte ao AVYO
            <textarea aria-label="Pergunte ao AVYO" rows="2" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} className="mt-2 min-h-12 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50" placeholder="Ex.: consigo separar dinheiro para uma meta este mês?" />
          </label>
          <Button type="button" onClick={() => send()} disabled={!draft.trim() || status === 'loading'}><Send size={16} />Enviar</Button>
        </div>
      </div>
    </Card>
  )
}
