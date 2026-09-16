import { useEffect, useRef } from 'react'
import { Button } from '../ui/Button'

export function LessonDialog({ lesson, onClose, onComplete }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!lesson) return undefined
    closeRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lesson, onClose])

  if (!lesson) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <article role="dialog" aria-modal="true" aria-label={lesson.title} className="avyo-card w-full max-w-xl p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Lição · {lesson.minutes} min</p>
        <h2 className="mt-2 font-heading text-2xl font-bold">{lesson.title}</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">{lesson.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="mt-7 flex justify-end gap-3">
          <Button ref={closeRef} variant="ghost" onClick={onClose}>Fechar</Button>
          <Button onClick={() => { onComplete(lesson.id); onClose() }}>Marcar como concluída</Button>
        </div>
      </article>
    </div>
  )
}
