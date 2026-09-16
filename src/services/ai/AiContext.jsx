import { createContext, useContext } from 'react'
import { createConfiguredBase44AiProvider } from './Base44AiProvider'
import { localAiFallback } from './LocalAiFallback'

const AiContext = createContext(null)
const configuredProvider = createConfiguredBase44AiProvider(import.meta.env.VITE_BASE44_APP_ID) || localAiFallback

export function AiProviderRoot({ children, provider = configuredProvider }) {
  return <AiContext.Provider value={provider}>{children}</AiContext.Provider>
}

export function useAi() {
  return useContext(AiContext) || localAiFallback
}
