export const AI_CAPABILITIES = ['planner', 'monthly-report', 'statement-parser']

export class AiProviderError extends Error {
  constructor(code, message, cause) {
    super(message)
    this.name = 'AiProviderError'
    this.code = code
    this.cause = cause
  }
}

function controlledSignal(externalSignal, timeoutMs) {
  const controller = new AbortController()
  let timedOut = false
  const cancel = () => controller.abort(externalSignal.reason)
  if (externalSignal?.aborted) cancel()
  else externalSignal?.addEventListener('abort', cancel, { once: true })
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort(new DOMException('Timed out', 'TimeoutError'))
  }, timeoutMs)
  return {
    signal: controller.signal,
    didTimeOut: () => timedOut,
    dispose: () => {
      clearTimeout(timer)
      externalSignal?.removeEventListener('abort', cancel)
    },
  }
}

export function createAiProvider({ invoke, timeoutMs = 15000 }) {
  const call = async (capability, input, options = {}) => {
    const request = controlledSignal(options.signal, timeoutMs)
    try {
      return await invoke(capability, input, { signal: request.signal })
    } catch (error) {
      if (request.didTimeOut()) throw new AiProviderError('timeout', 'A IA demorou mais que o esperado.', error)
      if (options.signal?.aborted) throw new AiProviderError('cancelled', 'A solicitação foi cancelada.', error)
      throw new AiProviderError('unavailable', 'A IA está indisponível.', error)
    } finally {
      request.dispose()
    }
  }

  return {
    answerPlanner: (input, options) => call('planner', input, options),
    generateMonthlyReport: (input, options) => call('monthly-report', input, options),
    parseStatement: (input, options) => call('statement-parser', input, options),
  }
}
