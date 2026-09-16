const errorResponse = (error, status) => Response.json({ error }, { status })

export function createAiFunction({ validatePayload, buildPrompt, responseSchema, maxBytes, getClient }) {
  return async (request) => {
    if (request.method !== 'POST') return errorResponse('method_not_allowed', 405)
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) return errorResponse('invalid_content_type', 415)

    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > maxBytes) return errorResponse('payload_too_large', 413)

    let input
    try { input = JSON.parse(raw) }
    catch { return errorResponse('invalid_json', 400) }

    let payload
    try { payload = validatePayload(input) }
    catch { return errorResponse('invalid_payload', 400) }

    try {
      const client = getClient(request)
      const result = await client.integrations.Core.InvokeLLM({
        prompt: buildPrompt(payload),
        response_json_schema: responseSchema,
      })
      return Response.json(result)
    } catch {
      return errorResponse('ai_unavailable', 502)
    }
  }
}
