import { createClientFromRequest } from "npm:@base44/sdk";
import { PLANNER_RESPONSE_SCHEMA, buildPlannerPrompt, validatePlannerPayload } from "./shared-contracts.js";
import { createAiFunction } from "./shared-runtime.js";

Deno.serve(createAiFunction({
  validatePayload: validatePlannerPayload,
  buildPrompt: buildPlannerPrompt,
  responseSchema: PLANNER_RESPONSE_SCHEMA,
  maxBytes: 16000,
  getClient: createClientFromRequest,
}));
