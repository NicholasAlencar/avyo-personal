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
  let rejectAbort
  const aborted = new Promise((_, reject) => { rejectAbort = reject })
  const rejectOnAbort = () => rejectAbort(controller.signal.reason || new DOMException('Aborted', 'AbortError'))
  if (controller.signal.aborted) rejectOnAbort()
  else controller.signal.addEventListener('abort', rejectOnAbort, { once: true })
  return {
    signal: controller.signal,
    aborted,
    didTimeOut: () => timedOut,
    dispose: () => {
      clearTimeout(timer)
      externalSignal?.removeEventListener('abort', cancel)
      controller.signal.removeEventListener('abort', rejectOnAbort)
    },
  }
}

export function createAiProvider({ invoke, timeoutMs = 15000 }) {
  const call = async (capability, input, options = {}) => {
    const request = controlledSignal(options.signal, timeoutMs)
    try {
      return await Promise.race([invoke(capability, input, { signal: request.signal }), request.aborted])
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
