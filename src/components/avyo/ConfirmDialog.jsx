import { useEffect, useId, useRef } from 'react'
import { Button } from '../ui/Button'

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', onConfirm, onClose }) {
  const titleId = useId()
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    cancelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      if (trigger?.isConnected) trigger.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div role="dialog" aria-modal="true" aria-labelledby={titleId} className="avyo-card w-full max-w-md p-6"><h2 id={titleId} className="font-heading text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-400">{description}</p><div className="mt-6 flex justify-end gap-3"><Button ref={cancelRef} variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button></div></div></div>
}
