import { useState } from 'react'
import { FileText, FileUp, Sparkles, X } from 'lucide-react'
import { buildStatementPayload } from '../../lib/aiPayloads'
import { inferColumnMap, normalizeImportedRows, parseCsv } from '../../lib/csv'
import { validateImportFile } from '../../lib/importFiles'
import { useAi } from '../../services/ai/AiContext'
import { Button } from '../ui/Button'

function localCsvRows(text) {
  const parsed = parseCsv(text)
  return normalizeImportedRows(parsed, inferColumnMap(Object.keys(parsed[0] || {}).filter((key) => key !== '_line')))
}

export function CsvImportDialog({ open, onClose, onImport }) {
  const ai = useAi()
  const [mode, setMode] = useState('csv')
  const [rows, setRows] = useState([])
  const [errors, setErrors] = useState([])
  const [sourceText, setSourceText] = useState('')
  const [sourceFormat, setSourceFormat] = useState('ofx')
  const [busy, setBusy] = useState(false)
  const [aiError, setAiError] = useState('')

  if (!open) return null

  const reviewCsv = (text) => {
    try {
      const normalized = localCsvRows(text)
      setRows(normalized.filter((row) => !row.error))
      setErrors(normalized.filter((row) => row.error).map((row) => row.error))
      setAiError('')
    } catch (error) {
      setRows([])
      setErrors([])
      setAiError(error instanceof Error ? error.message : 'Não foi possível ler este CSV.')
    }
  }

  const readCsv = async (event) => {
    const file = event.target.files?.[0]
    const validation = validateImportFile(file, 'csv')
    if (!validation.ok) return setAiError(validation.error)
    const text = await file.text()
    setSourceText(text || '')
    reviewCsv(text || '')
  }

  const readStatement = async (event) => {
    const file = event.target.files?.[0]
    const validation = validateImportFile(file, 'statement')
    if (!validation.ok) return setAiError(validation.error)
    const text = await file.text()
    setSourceText(text)
    setSourceFormat(validation.format)
    setRows([])
    setErrors([])
    setAiError('')
  }

  const parseWithAi = async () => {
    if (!sourceText.trim()) return setAiError('Cole o extrato ou escolha um arquivo antes de interpretar.')
    setBusy(true)
    setAiError('')
    try {
      const result = await ai.parseStatement(buildStatementPayload(sourceText, { format: sourceFormat }))
      const validRows = Array.isArray(result?.rows) ? result.rows.filter((row) => row && row.date && row.description && Number.isFinite(Number(row.amount))) : []
      setRows(validRows.map((row) => ({ ...row, amount: Math.abs(Number(row.amount)), type: row.type === 'income' ? 'income' : 'expense', category: row.category || 'Outros', recurring: Boolean(row.recurring) })))
      setErrors(Array.isArray(result?.warnings) ? result.warnings : [])
      if (!validRows.length) setAiError('Não encontrei transações válidas. O conteúdo original foi mantido para você revisar.')
    } catch {
      setAiError('Não foi possível interpretar localmente. O conteúdo original continua aqui; você pode ajustar ou revisar como CSV.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4"><div role="dialog" aria-modal="true" aria-label="Importar transações" className="avyo-card my-6 w-full max-w-3xl p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-heading text-xl font-bold">Importar extrato</h2><p className="mt-1 text-sm text-slate-400">CSV, OFX e texto são processados somente neste navegador.</p></div><button type="button" aria-label="Fechar" onClick={onClose} className="grid size-10 place-items-center rounded-xl bg-white/[0.05]"><X /></button></div>

    <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.035] p-1"><button type="button" onClick={() => { setMode('csv'); setRows([]); setErrors([]); setAiError('') }} className={`min-h-10 rounded-xl px-3 text-sm font-semibold ${mode === 'csv' ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-400'}`}>CSV local</button><button type="button" onClick={() => { setMode('ai'); setRows([]); setErrors([]); setAiError('') }} className={`min-h-10 rounded-xl px-3 text-sm font-semibold ${mode === 'ai' ? 'bg-violet-400/10 text-violet-200' : 'text-slate-400'}`}>OFX / texto local</button></div>

    {mode === 'csv' ? <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.04] p-8 text-center"><FileUp className="text-cyan-300" /><span className="mt-2 text-sm font-semibold">Escolha seu arquivo CSV</span><span className="mt-1 text-xs text-slate-500">Nada sai deste navegador.</span><input type="file" accept=".csv,text/csv" className="sr-only" onChange={readCsv} /></label> : <div className="mt-6 space-y-4"><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-violet-300/20 bg-violet-300/[0.035] p-4"><FileText className="text-violet-300" /><span className="flex-1 text-sm"><strong className="block text-slate-200">Escolher OFX ou arquivo de texto</strong><span className="text-slate-500">O conteúdo será carregado e interpretado somente neste navegador.</span></span><input type="file" accept=".ofx,.txt,text/plain,application/x-ofx" className="sr-only" onChange={readStatement} /></label><label className="block text-sm text-slate-300">Conteúdo do extrato<textarea aria-label="Conteúdo do extrato" value={sourceText} onChange={(e) => setSourceText(e.target.value)} rows={8} placeholder="Cole aqui o conteúdo OFX ou texto do extrato…" className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0c1426] p-3 font-mono text-xs text-slate-200 outline-none focus:border-violet-400/50" /></label><div className="flex flex-wrap gap-2"><Button disabled={busy || !sourceText.trim()} onClick={parseWithAi}><Sparkles size={16} />{busy ? 'Interpretando…' : 'Interpretar localmente'}</Button>{aiError && sourceText && <Button variant="secondary" onClick={() => { setMode('csv'); reviewCsv(sourceText) }}>Revisar manualmente como CSV</Button>}</div></div>}

    {aiError && <p role="alert" className="mt-4 text-sm text-amber-300">{aiError}</p>}

    {rows.length > 0 && <div className="mt-5 max-h-60 overflow-auto rounded-xl border border-white/[0.06]"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-[#10192b] text-slate-400"><tr><th className="p-3">Data</th><th>Descrição</th><th>Categoria</th><th className="pr-3 text-right">Valor</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.date}-${row.description}-${index}`} className="border-t border-white/[0.05]"><td className="p-3">{row.date}</td><td>{row.description}</td><td>{row.category}</td><td className="pr-3 text-right">{row.type === 'income' ? '+' : '−'} {Number(row.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>)}</tbody></table></div>}
    {errors.map((error, index) => <p key={`${error}-${index}`} className="mt-2 text-sm text-amber-300">{typeof error === 'string' ? error : error.error}</p>)}
    <div className="mt-6 flex justify-end gap-3"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={!rows.length} onClick={() => { onImport(rows); onClose() }}>Importar {rows.length || ''}</Button></div>
  </div></div>
}
