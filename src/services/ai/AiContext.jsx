import { createContext, useContext } from 'react'
import { localAiFallback } from './LocalAiFallback'

const AiContext = createContext(null)

export function AiProviderRoot({ children, provider = localAiFallback }) {
  return <AiContext.Provider value={provider}>{children}</AiContext.Provider>
}

export function useAi() {
  return useContext(AiContext) || localAiFallback
}
