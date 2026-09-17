# AVYO Personal Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the verified local privacy, file-import, remote-AI, external-font, and supply-chain gaps while preserving the application's deterministic local behavior.

**Architecture:** Keep financial state browser-local, centralize deletion and file-boundary rules in pure data modules, and make the default AI context local-only. Configuration hardening pins the already-resolved package and action versions without upgrading runtime behavior.

**Tech Stack:** React 19, Vite 8, Vitest 5, pnpm, Base44 SDK/function contracts, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-17-security-hardening-design.md`

## Global Constraints

- Do not add login, remote financial storage, AVYO Empresas integration, or a fake frontend secret.
- Base44 backend functions remain in the repository, but the default UI must never invoke them.
- Reject invalid files before calling `file.text()`.
- Remove only AVYO-owned localStorage keys; never call `localStorage.clear()`.
- Preserve the existing local fallback and all 19 canonical routes.
- Follow red-green-refactor for behavior changes and commit each independently testable task.

---

### Task 1: Complete local-data deletion

**Files:**
- Modify: `src/data/storage.test.js`
- Modify: `src/data/storage.js`
- Modify: `src/context/FinanceContext.jsx`
- Modify: `src/pages/SettingsPage.test.jsx`

**Interfaces:**
- Produces: `clearStoredState(storage): normalized EMPTY_STATE`
- Consumes: `STORAGE_KEY`, `CORRUPT_BACKUP_KEY`, `saveState`, and `EMPTY_STATE`

- [ ] **Step 1: Add a failing storage test**

```js
test('clearStoredState removes every AVYO key and persists empty state', () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: '{"profile":{"name":"Marina"}}',
    [CORRUPT_BACKUP_KEY]: 'financial backup',
    unrelated: 'keep me',
  })
  clearStoredState(storage)
  expect(storage.getItem(CORRUPT_BACKUP_KEY)).toBeNull()
  expect(JSON.parse(storage.getItem(STORAGE_KEY))).toMatchObject({ version: 2, transactions: [] })
  expect(storage.getItem('unrelated')).toBe('keep me')
})
```

- [ ] **Step 2: Run the storage test and confirm RED**

Run: `pnpm exec vitest run src/data/storage.test.js`

Expected: FAIL because `clearStoredState` is not exported.

- [ ] **Step 3: Implement the storage operation and connect the context**

```js
export function clearStoredState(storage = globalThis.localStorage) {
  storage?.removeItem(STORAGE_KEY)
  storage?.removeItem(CORRUPT_BACKUP_KEY)
  const empty = normalizeState(EMPTY_STATE)
  storage?.setItem(STORAGE_KEY, JSON.stringify(empty))
  return empty
}
```

Change `FinanceContext.clearAll` to update React state with the returned empty state without routing through `commit`, which would obscure the deletion boundary.

- [ ] **Step 4: Add and run a Settings regression test**

Seed both AVYO keys, click “Apagar meus dados”, and assert that the corrupt backup is absent and the primary value contains the empty normalized state.

Run: `pnpm exec vitest run src/data/storage.test.js src/pages/SettingsPage.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/storage.js src/data/storage.test.js src/context/FinanceContext.jsx src/pages/SettingsPage.test.jsx
git commit -m "fix: fully clear local financial data"
```

### Task 2: Enforce file-import limits before reading

**Files:**
- Create: `src/lib/importFiles.js`
- Create: `src/lib/importFiles.test.js`
- Modify: `src/lib/csv.js`
- Modify: `src/lib/csv.test.js`
- Modify: `src/components/avyo/CsvImportDialog.jsx`
- Modify: `src/components/avyo/Dialog.test.jsx`

**Interfaces:**
- Produces: `validateImportFile(file, mode)` returning `{ ok: true, format }` or `{ ok: false, error }`
- Produces: `MAX_IMPORT_BYTES = 2 * 1024 * 1024`, `MAX_CSV_LINES = 10000`
- Consumes: browser `File` properties `name`, `type`, `size`, and method `text()`

- [ ] **Step 1: Add failing pure validation tests**

Test accepted CSV/OFX/text combinations, an empty MIME type, incompatible extension/MIME, and a file one byte over `MAX_IMPORT_BYTES`.

Run: `pnpm exec vitest run src/lib/importFiles.test.js`

Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement `validateImportFile`**

Use explicit allowlists from the approved spec. Return Portuguese errors and never read file content inside the validator.

- [ ] **Step 3: Add a failing CSV line-limit test**

```js
test('rejects CSV input above the row limit', () => {
  const text = ['data,descricao,valor', ...Array.from({ length: 10001 }, () => '2026-09-17,item,-1')].join('\n')
  expect(() => parseCsv(text)).toThrow(/10\.000 linhas/i)
})
```

Run: `pnpm exec vitest run src/lib/csv.test.js`

Expected: FAIL because `parseCsv` currently parses every line.

- [ ] **Step 4: Enforce `MAX_CSV_LINES` in `parseCsv`**

Count non-empty data rows after removing the header and throw a user-safe error before mapping rows.

- [ ] **Step 5: Connect validation to the dialog**

Validate the selected file before `file.text()`, preserve existing source content after rejection, and display the returned error in the dialog. Catch local CSV parsing errors and display them instead of rejecting the React handler promise.

- [ ] **Step 6: Add a component test proving oversized files are not read**

Use a File-like object whose `text` spy would fail the test if called, dispatch it through the CSV input, and assert the size error is displayed while `text` remains uncalled.

Run: `pnpm exec vitest run src/lib/importFiles.test.js src/lib/csv.test.js src/components/avyo/Dialog.test.jsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/importFiles.js src/lib/importFiles.test.js src/lib/csv.js src/lib/csv.test.js src/components/avyo/CsvImportDialog.jsx src/components/avyo/Dialog.test.jsx
git commit -m "fix: validate statement imports before reading"
```

### Task 3: Make the shipped AI path local-only

**Files:**
- Create: `src/services/ai/AiContext.test.jsx`
- Modify: `src/services/ai/AiContext.jsx`
- Modify: `src/pages/SettingsPage.jsx`
- Modify: `src/pages/SettingsPage.test.jsx`
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Produces: default `AiProviderRoot` value equal to `localAiFallback`
- Preserves: optional injected `provider` prop for deterministic unit tests
- Removes: runtime dependence on `VITE_BASE44_APP_ID`

- [ ] **Step 1: Add a failing AI-context test**

Mock or inject an environment with a Base44 app ID, render a consumer under the default provider, call `answerPlanner`, and assert the result has local mode without invoking a remote client.

Run: `pnpm exec vitest run src/services/ai/AiContext.test.jsx`

Expected: FAIL because the current module constructs the Base44 provider when the environment variable is present.

- [ ] **Step 2: Remove default remote-provider construction**

Delete the Base44 provider import and use `localAiFallback` as the default provider. Keep `provider` injection supported so provider contracts remain testable.

- [ ] **Step 3: Update privacy copy and configuration**

Remove `VITE_BASE44_APP_ID` from `.env.example`. State in Settings and README that remote IA is blocked until authenticated backend access exists; keep local planner/report behavior described accurately.

- [ ] **Step 4: Run focused tests**

Run: `pnpm exec vitest run src/services/ai/AiContext.test.jsx src/pages/SettingsPage.test.jsx src/pages/PlannerPage.test.jsx src/pages/ReportPage.test.jsx`

Expected: PASS with no Base44 invocation from the default UI.

- [ ] **Step 5: Run boundary verification and commit**

Run: `pnpm verify:boundary`

Expected: PASS with only the existing bridge and three backend functions.

```bash
git add src/services/ai/AiContext.jsx src/services/ai/AiContext.test.jsx src/pages/SettingsPage.jsx src/pages/SettingsPage.test.jsx .env.example README.md
git commit -m "fix: keep remote AI disabled until authentication"
```

### Task 4: Remove third-party fonts and pin the supply chain

**Files:**
- Modify: `src/styles.css`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.github/workflows/verify.yml`

**Interfaces:**
- Consumes: exact versions resolved in the existing lockfile
- Produces: system font stacks and immutable GitHub Action revisions

- [ ] **Step 1: Remove the Google Fonts import**

Delete the `@import` URL and replace `Inter`/`Outfit` fallbacks with system sans-serif stacks while preserving the existing `font-heading` and body roles.

- [ ] **Step 2: Pin package versions**

Replace ranges and `latest` with these resolved versions:

```text
@base44/sdk 0.8.48
@tailwindcss/vite 4.3.3
clsx 2.1.1
framer-motion 13.3.0
lucide-react 1.46.0
react 19.3.0
react-dom 19.3.0
react-router-dom 7.18.3
recharts 3.10.1
tailwind-merge 3.7.0
@testing-library/jest-dom 7.0.1
@testing-library/react 16.3.3
@testing-library/user-event 14.6.7
@vitejs/plugin-react 6.1.1
base44 0.0.50
jsdom 30.0.1
tailwindcss 4.3.3
vite 8.3.0
vitest 5.0.1
```

Run: `pnpm install --lockfile-only`

- [ ] **Step 3: Pin GitHub Actions**

Use:

```yaml
- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
- uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
```

- [ ] **Step 4: Verify configuration and commit**

Run: `pnpm install --frozen-lockfile`

Run: `pnpm audit --json`

Expected: installation succeeds and reports zero known vulnerabilities.

```bash
git add src/styles.css package.json pnpm-lock.yaml .github/workflows/verify.yml
git commit -m "chore: pin dependencies and remove remote fonts"
```

### Task 5: Full security regression verification

**Files:**
- Modify only if a verification exposes a defect covered by the approved spec; follow a new red-green cycle before changing behavior.

**Interfaces:**
- Consumes: all tasks above
- Produces: evidence that the hardened branch remains buildable and local-first

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test:run`

Expected: 40 files and all tests pass. If the known five-second patrimonio timeout recurs, run the affected files in isolation and report both results without hiding the full-suite failure.

- [ ] **Step 2: Verify architectural boundary and dependencies**

Run: `pnpm verify:boundary`

Run: `pnpm audit --json`

Expected: boundary passes and the audit reports zero vulnerabilities.

- [ ] **Step 3: Build production assets**

Run: `pnpm build`

Expected: exit code 0.

- [ ] **Step 4: Run security scans**

Search tracked source and Git history for credential patterns without printing candidate values. Search runtime code for dangerous HTML, dynamic code execution, shell invocation, remote font URLs, and unexpected Base44 frontend calls.

Expected: no confirmed secret, injection, external-font, or boundary violations.

- [ ] **Step 5: Inspect repository state**

Run: `git diff --check` and `git status --short --branch`.

Expected: no whitespace errors and only intentional commits on `feature/avyo-v2-base44-ai`.
