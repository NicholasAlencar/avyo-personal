import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'

const inputClass = 'mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-[#0c1426] px-3 text-white outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20'

export function RecordDialog({ open, title, fields, initial = {}, onClose, onSave }) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState('')
  const titleRef = useRef(null)
  useEffect(() => { if (open) { setValues(initial); setError(''); setTimeout(() => titleRef.current?.focus(), 0) } }, [open, initial])
  if (!open) return null
  const submit = (event) => {
    event.preventDefault()
    const missing = fields.find((field) => field.required && !String(values[field.name] ?? '').trim())
    if (missing) return setError(`Preencha ${missing.label.toLowerCase()}.`)
    const output = Object.fromEntries(fields.map((field) => [field.name, field.type === 'number' ? Number(values[field.name] || 0) : field.type === 'checkbox' ? Boolean(values[field.name]) : values[field.name] ?? field.defaultValue ?? '']))
    onSave({ ...initial, ...output }); onClose()
  }
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="record-dialog-title" className="avyo-card my-6 w-full max-w-lg p-6"><div className="mb-5 flex items-center justify-between"><h2 ref={titleRef} tabIndex="-1" id="record-dialog-title" className="font-heading text-xl font-bold outline-none">{title}</h2><button aria-label="Fechar" onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-white/[0.05]"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => field.type === 'checkbox' ? <label key={field.name} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3 text-sm text-slate-300 sm:col-span-2"><input type="checkbox" checked={Boolean(values[field.name])} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.checked }))} />{field.label}</label> : <label key={field.name} className={`text-sm text-slate-300 ${field.wide ? 'sm:col-span-2' : ''}`}>{field.label}{field.type === 'select' ? <select className={inputClass} value={values[field.name] ?? field.defaultValue ?? ''} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input className={inputClass} type={field.type || 'text'} min={field.min} value={values[field.name] ?? field.defaultValue ?? ''} onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))} required={field.required} />}</label>)}</div>{error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar</Button></div></form></div>
}
