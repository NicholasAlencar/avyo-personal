import { useState } from 'react'
import { FileUp, X } from 'lucide-react'
import { inferColumnMap, normalizeImportedRows, parseCsv } from '../../lib/csv'
import { Button } from '../ui/Button'

export function CsvImportDialog({ open, onClose, onImport }) {
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState([])
  if (!open) return null
  const read = async (event) => {
    const text = await event.target.files?.[0]?.text()
    const parsed = parseCsv(text)
    const normalized = normalizeImportedRows(parsed, inferColumnMap(Object.keys(parsed[0] || {})))
    setRows(normalized.filter((row) => !row.error)); setErrors(normalized.filter((row) => row.error))
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"><div role="dialog" aria-modal="true" aria-label="Importar transações CSV" className="avyo-card w-full max-w-2xl p-6"><div className="flex items-center justify-between"><div><h2 className="font-heading text-xl font-bold">Importar CSV</h2><p className="mt-1 text-sm text-slate-400">Tudo é processado neste navegador.</p></div><button aria-label="Fechar" onClick={onClose}><X /></button></div><label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.04] p-8 text-center"><FileUp className="text-cyan-300" /><span className="mt-2 text-sm font-semibold">Escolha seu arquivo CSV</span><input type="file" accept=".csv,text/csv" className="sr-only" onChange={read} /></label>{rows.length > 0 && <div className="mt-5 max-h-52 overflow-auto rounded-xl border border-white/[0.06]"><table className="w-full text-left text-sm"><thead className="bg-white/[0.04] text-slate-400"><tr><th className="p-3">Data</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.date}-${index}`} className="border-t border-white/[0.05]"><td className="p-3">{row.date}</td><td>{row.description}</td><td>{row.amount}</td></tr>)}</tbody></table></div>}{errors.map((row) => <p key={row.line} className="mt-2 text-sm text-amber-300">{row.error}</p>)}<div className="mt-6 flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={!rows.length} onClick={() => { onImport(rows); onClose() }}>Importar {rows.length || ''}</Button></div></div></div>
}
