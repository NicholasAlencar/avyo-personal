import { Bot, User } from 'lucide-react'

export function PlannerMessage({ message }) {
  const assistant = message.role === 'assistant'
  return (
    <article className={`flex gap-3 ${assistant ? '' : 'flex-row-reverse'}`} aria-label={assistant ? 'Resposta do AVYO' : 'Sua mensagem'}>
      <div className={`grid size-9 shrink-0 place-items-center rounded-xl ${assistant ? 'bg-cyan-400/10 text-cyan-300' : 'bg-violet-400/10 text-violet-300'}`}>
        {assistant ? <Bot size={17} /> : <User size={17} />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${assistant ? 'bg-white/[0.045]' : 'bg-violet-400/10'}`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-200">{message.text}</p>
          {assistant && message.mode && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${message.mode === 'local' ? 'bg-amber-400/10 text-amber-200' : 'bg-cyan-400/10 text-cyan-200'}`}>{message.mode === 'local' ? 'modo local' : 'Base44'}</span>}
        </div>
        {message.actions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">{message.actions.slice(0, 3).map((action, index) => <span key={`${action}-${index}`} className="rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs text-slate-400">{typeof action === 'string' ? action : action.label}</span>)}</div>
        )}
      </div>
    </article>
  )
}
