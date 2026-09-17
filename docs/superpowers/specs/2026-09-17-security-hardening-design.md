# AVYO Personal Security Hardening Design

## Objective

Resolve the verified security and privacy gaps found in the repository review without introducing a simulated security boundary. Remote AI must remain unavailable until the product has authenticated users and an enforceable backend boundary; deterministic local fallbacks remain available.

## Scope

This change covers four areas:

1. Complete deletion of locally stored financial data.
2. Defensive validation of CSV, OFX, and text imports before reading or processing files.
3. Removal of third-party font requests and tighter supply-chain pinning.
4. Blocking Base44 AI network calls until authenticated backend access exists.

It does not add login, user accounts, remote financial storage, AVYO Empresas integration, encryption at rest, or a production deployment.

## Local data deletion

The storage module will expose a single operation that removes every AVYO-owned localStorage key, including the primary state and corrupt-state backup, and then persists a normalized empty state. `FinanceContext.clearAll` will use that operation instead of only overwriting the primary key.

Tests will prove that both keys are removed and that the visible application state becomes empty. No unrelated origin storage will be cleared.

## File import boundary

File validation will live in a small module independent of React. It will accept a `File`-like object and an import mode and return either validated metadata or a user-safe error.

Rules:

- CSV: maximum 2 MiB; accepted extensions `.csv`; accepted MIME types `text/csv`, `application/csv`, `text/plain`, or an empty browser-provided type.
- OFX/text: maximum 2 MiB; accepted extensions `.ofx` and `.txt`; accepted MIME types `application/x-ofx`, `application/ofx`, `text/plain`, `application/octet-stream`, or an empty browser-provided type.
- Files with a disallowed extension, explicit incompatible MIME type, or excessive size are rejected before `file.text()`.
- Local CSV parsing is capped at 10,000 non-empty lines.
- AI statement payloads remain capped at 50,000 characters by the existing payload and backend validators.

The dialog will display validation errors without replacing the previously loaded source. Tests will cover oversize files, incompatible types, accepted browser-empty MIME types, and the CSV row cap.

## Remote AI gate

The Base44 provider will not be constructed from a public frontend app ID in this release. The default `AiContext` provider will always be the local fallback. Existing Base44 provider and backend function code will remain in the repository for future authenticated integration and contract tests, but no application UI path will invoke it.

The environment example and product copy will explicitly state that remote AI is unavailable until authenticated backend access is implemented. The automated Base44 boundary remains in place to prevent expansion of the remote surface.

This is intentionally stricter than origin checks, frontend tokens, or in-memory serverless rate limits, none of which establish a reliable identity or abuse boundary.

## Fonts and supply chain

The Google Fonts CSS import will be removed. The existing visual roles will use system font stacks with compatible fallbacks; no font binaries will be downloaded or added.

All package versions in `package.json` will be replaced with the exact versions already resolved by `pnpm-lock.yaml`, preserving behavior. GitHub Actions will be pinned to verified commit SHAs while retaining comments that identify the corresponding release tags. Lockfile installation remains frozen in CI.

## Error handling and user communication

Rejected imports will produce concise Portuguese messages describing the limit or accepted format. Remote-AI controls will not imply that data can currently leave the browser. Local planner and report behavior remain available.

## Testing and verification

Implementation follows red-green-refactor:

- Add failing storage deletion tests, implement the deletion operation, and rerun them.
- Add failing pure file-validation and line-limit tests, implement the boundary, and rerun them.
- Add failing AI-context tests proving the configured frontend app ID cannot activate a remote provider, then remove provider construction from the default path.
- Update copy/configuration assertions where necessary.

Final verification:

- `pnpm test:run`
- `pnpm verify:boundary`
- `pnpm audit --json`
- `pnpm build`
- secret and dangerous-API scans from the installed `vibecoder-review` skill
- inspection that the build contains no source maps or Google Fonts URL

## Success criteria

- “Apagar tudo” leaves no AVYO corrupt backup behind.
- Oversized or incompatible imports are rejected before reading.
- CSV parsing cannot create more than 10,000 input records.
- No default UI action can invoke Base44 remotely.
- The production bundle makes no Google Fonts request.
- Manifests and CI actions are reproducibly pinned.
- Existing local-first financial features remain functional.
