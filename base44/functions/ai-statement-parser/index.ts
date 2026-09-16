import { createClientFromRequest } from "npm:@base44/sdk";
import { STATEMENT_RESPONSE_SCHEMA, buildStatementPrompt, validateStatementPayload } from "./shared-contracts.js";
import { createAiFunction } from "./shared-runtime.js";

Deno.serve(createAiFunction({
  validatePayload: validateStatementPayload,
  buildPrompt: buildStatementPrompt,
  responseSchema: STATEMENT_RESPONSE_SCHEMA,
  maxBytes: 52000,
  getClient: createClientFromRequest,
}));
