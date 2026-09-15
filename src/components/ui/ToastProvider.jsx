import { createContext, useContext, useMemo, useState } from 'react'
const ToastContext = createContext({ toast: () => {} })
export function ToastProvider({ children }) { const [message, setMessage] = useState(''); const value = useMemo(() => ({ toast: (text) => { setMessage(text); setTimeout(() => setMessage(''), 2500) } }), []); return <ToastContext.Provider value={value}>{children}{message && <div role="status" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm shadow-2xl">{message}</div>}</ToastContext.Provider> }
export const useToast = () => useContext(ToastContext)
