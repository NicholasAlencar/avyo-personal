import { createClientFromRequest } from "npm:@base44/sdk";
import { REPORT_RESPONSE_SCHEMA, buildReportPrompt, validateReportPayload } from "./shared-contracts.js";
import { createAiFunction } from "./shared-runtime.js";

Deno.serve(createAiFunction({
  validatePayload: validateReportPayload,
  buildPrompt: buildReportPrompt,
  responseSchema: REPORT_RESPONSE_SCHEMA,
  maxBytes: 12000,
  getClient: createClientFromRequest,
}));
