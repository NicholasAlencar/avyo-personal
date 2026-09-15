# AVYO Personal v2 + Base44 AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evoluir as 20 janelas do AVYO Personal para o modelo local v2 e conectar somente Planejador, relatório mensal e leitura assistida de extratos a funções stateless do Base44.

**Architecture:** O React continua local-first, com persistência exclusiva em `localStorage`, cálculos puros e fallback determinístico. Uma porta `AiProvider` isola o frontend do fornecedor; o adaptador Base44 chama exatamente três funções backend-only, sem Auth, Entities, Agents, Hosting, Connectors ou armazenamento remoto.

**Tech Stack:** React, Vite, React Router, Tailwind CSS, Vitest, Testing Library, Recharts, Framer Motion, Base44 CLI/SDK somente na fronteira de IA.

**Spec:** `docs/superpowers/specs/2026-09-15-avyo-base44-ai-gateway-design.md`

## Global Constraints

- O app deve funcionar offline em todas as operações não relacionadas à IA.
- O documento persistido continua na chave `avyo-personal:v1`, mas seu campo interno passa a `version: 2` para evitar duplicação ou perda dos dados existentes.
- Base44 é permitido somente para `ai-planner`, `ai-monthly-report` e `ai-statement-parser`.
- Nenhum componente de domínio pode importar `@base44/sdk`; somente `src/services/ai/Base44AiProvider.js` pode fazê-lo.
- Nenhum dado é gravado remotamente; não criar entidades, autenticação, agentes, conectores nem site Base44.
- Toda transmissão para IA exige `settings.aiEnabled === true` e `settings.aiDisclosureAccepted === true`.
- Todos os payloads devem remover ids internos, email, nomes pessoais e notas livres não relacionadas.
- Toda chamada de IA aceita `AbortSignal`, tem timeout de 15 segundos e preserva a entrada do usuário quando falha.
- Respostas financeiras usam linguagem educacional e não prometem retorno, não movimentam dinheiro e não substituem aconselhamento profissional.
- Rotas curtas existentes permanecem válidas por redirecionamento.
- Toda alteração funcional começa por teste falhando, passa por implementação mínima e termina com commit próprio.

---

## File Structure

### Estado, cálculos e serviços

- `src/data/schema.js`: estado v2, normalização e migração v1 → v2.
- `src/data/storage.js`: carga, backup de conteúdo inválido e gravação normalizada.
- `src/data/seed.js`: demonstração compatível com v2.
- `src/context/FinanceContext.jsx`: comandos genéricos, perfil, configurações, plano e perfil de investimento.
- `src/lib/dashboard.js`: cinco indicadores, trilhas e situação do início.
- `src/lib/budgets.js`: categorias, médias de três meses e sugestão arredondada.
- `src/lib/investments.js`: suitability, alocação, metas e comparação educativa.
- `src/lib/untilPayday.js`: compromissos, ritmo, status e simulações.
- `src/lib/aiPayloads.js`: resumos sanitizados e limites de tamanho.
- `src/services/ai/AiProvider.js`: contrato e estados de erro independentes do fornecedor.
- `src/services/ai/Base44AiProvider.js`: única importação do SDK e invocação das três funções.
- `src/services/ai/LocalAiFallback.js`: respostas determinísticas para os três fluxos.
- `src/services/ai/AiContext.jsx`: provider React e seleção entre Base44/fallback.

### Base44

- `base44/config.jsonc`: configuração backend-only criada pelo CLI.
- `base44/functions/_shared/http.ts`: CORS, JSON, limites e respostas de erro.
- `base44/functions/_shared/safety.ts`: instruções financeiras comuns e recusa segura.
- `base44/functions/ai-planner/{function.jsonc,index.ts}`: chat educativo estruturado.
- `base44/functions/ai-monthly-report/{function.jsonc,index.ts}`: leitura mensal estruturada.
- `base44/functions/ai-statement-parser/{function.jsonc,index.ts}`: normalização de extrato.

### Rotas e interface

- `src/App.jsx`, `src/components/avyo/NavItems.jsx`, `src/components/avyo/RouteNav.jsx`: rotas canônicas e aliases.
- `src/components/avyo/RecordDialog.jsx`, `ConfirmDialog.jsx`, `EmptyState.jsx`, `AiDisclosure.jsx`: padrões compartilhados de CRUD, vazio e IA.
- Páginas existentes em `src/pages/`: composição das 20 janelas.
- Componentes focados em `src/components/avyo/`: cartões, timelines, abas, chat e wizard.

---

### Task 1: Migrar o estado local para v2 sem perda

**Files:**
- Modify: `src/data/schema.js`
- Modify: `src/data/storage.js`
- Modify: `src/data/seed.js`
- Modify: `src/context/FinanceContext.jsx`
- Modify: `src/data/storage.test.js`
- Modify: `src/context/FinanceContext.test.jsx`

**Interfaces:**
- Produces: `normalizeState(value): FinanceStateV2`, `updateSettings(patch)`, `updateInvestmentProfile(patch)`, `updatePaydayPlan(next)`.
- Preserves: `STORAGE_KEY === 'avyo-personal:v1'` and corrupt backup behavior.

- [ ] **Step 1: Write migration and command tests**

```js
it('migrates v1 without losing collections or ids', () => {
  const v1 = { version: 1, transactions: [{ id: 'tx-1', amount: 90 }], profile: { name: 'Ana' } }
  const v2 = normalizeState(v1)
  expect(v2.version).toBe(2)
  expect(v2.transactions).toEqual(v1.transactions)
  expect(v2.profile).toMatchObject({ name: 'Ana', businessConnected: false, monthlyInvestmentGoal: 0 })
  expect(v2.settings).toEqual({ aiEnabled: false, aiDisclosureAccepted: false })
})

it('updates settings without replacing finance collections', async () => {
  const { result } = renderHook(() => useFinanceStore(), { wrapper })
  act(() => result.current.updateSettings({ aiEnabled: true }))
  expect(result.current.state.settings.aiEnabled).toBe(true)
  expect(result.current.state.transactions.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run the focused tests and confirm red**

Run: `pnpm vitest run src/data/storage.test.js src/context/FinanceContext.test.jsx`

Expected: FAIL because the normalized version is `1`, `settings` is absent and `updateSettings` is undefined.

- [ ] **Step 3: Implement the v2 defaults and commands**

```js
export const EMPTY_STATE = {
  version: 2,
  transactions: [], cards: [], installments: [], subscriptions: [], budgets: [], goals: [],
  assets: [], liabilities: [], investments: [],
  profile: {
    name: '', email: '', income: 0, essentialCost: 0, monthsGoal: 6, reserveAmount: 0,
    payday: 5, closingDay: 25, completedLessons: [], hasBusiness: false,
    businessConnected: false, proLabore: 0, profitDistribution: 0,
    businessPersonalExpenses: 0, businessNetWorth: 0, monthlyInvestmentGoal: 0,
    investmentTotalGoal: 0, onboarded: false,
  },
  investmentProfile: {
    answers: {}, profile: 'equilibrado', tolerance: 0, capacity: 0, horizon: 0,
    reasons: [], priorities: [], updatedAt: null,
  },
  atePagamento: null,
  settings: { aiEnabled: false, aiDisclosureAccepted: false },
}

export function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {}
  const result = clone(EMPTY_STATE)
  result.version = 2
  for (const key of collections) result[key] = Array.isArray(source[key]) ? source[key] : []
  result.profile = { ...result.profile, ...(isObject(source.profile) ? source.profile : {}) }
  result.profile.completedLessons = Array.isArray(result.profile.completedLessons) ? result.profile.completedLessons : []
  result.investmentProfile = { ...result.investmentProfile, ...(isObject(source.investmentProfile) ? source.investmentProfile : {}) }
  result.settings = { ...result.settings, ...(isObject(source.settings) ? source.settings : {}) }
  result.atePagamento = isObject(source.atePagamento)
    ? { extraItems: [], paidItemIds: [], todaySpent: 0, createdAt: new Date().toISOString(), ...source.atePagamento }
    : null
  return result
}
```

Add memoized commands using `commit`:

```js
const updateSettings = useCallback((patch) => commit((current) => ({
  ...current, settings: { ...current.settings, ...patch },
})), [commit])
const updateInvestmentProfile = useCallback((patch) => commit((current) => ({
  ...current, investmentProfile: { ...current.investmentProfile, ...patch },
})), [commit])
const updatePaydayPlan = useCallback((next) => commit((current) => ({
  ...current, atePagamento: typeof next === 'function' ? next(current.atePagamento) : next,
})), [commit])
```

- [ ] **Step 4: Run state tests**

Run: `pnpm vitest run src/data/storage.test.js src/context/FinanceContext.test.jsx`

Expected: PASS, including legacy load, corrupt backup and new command tests.

- [ ] **Step 5: Commit**

```bash
git add src/data/schema.js src/data/storage.js src/data/seed.js src/context/FinanceContext.jsx src/data/storage.test.js src/context/FinanceContext.test.jsx
git commit -m "feat: migrate AVYO local state to version 2"
```

### Task 2: Canonicalizar rotas e subnavegação

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/components/avyo/NavItems.jsx`
- Modify: `src/components/avyo/RouteNav.jsx`

**Interfaces:**
- Produces: canonical movement, planning and learning paths.
- Preserves: all current short paths through `<Navigate replace>`.

- [ ] **Step 1: Write route contract tests**

```jsx
it.each([
  ['/movimentacoes/transacoes', 'Transações'],
  ['/planejamento/orcamento', 'Orçamento'],
  ['/aprender/escola', 'Escola AVYO'],
])('renders canonical route %s', async (path, heading) => {
  renderApp(path)
  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
})

it('redirects the legacy transactions path', async () => {
  renderApp('/transacoes')
  expect(await screen.findByRole('heading', { name: 'Transações' })).toBeInTheDocument()
  expect(window.location.pathname).toBe('/movimentacoes/transacoes')
})
```

- [ ] **Step 2: Run the route tests and confirm red**

Run: `pnpm vitest run src/App.test.jsx`

Expected: FAIL because canonical nested paths are not registered.

- [ ] **Step 3: Register canonical routes and aliases**

```jsx
const redirects = {
  '/transacoes': '/movimentacoes/transacoes', '/cartoes': '/movimentacoes/cartoes',
  '/parcelamentos': '/movimentacoes/parcelamentos', '/assinaturas': '/movimentacoes/assinaturas',
  '/orcamento': '/planejamento/orcamento', '/metas': '/planejamento/metas',
  '/escola': '/aprender/escola', '/calculadoras': '/aprender/calculadoras', '/ajuda': '/aprender/ajuda',
}

{Object.entries(redirects).map(([from, to]) => (
  <Route key={from} path={from} element={<Navigate replace to={to} />} />
))}
```

Update navigation constants to use only canonical destinations while keeping `/reserva`, `/ate-pagamento`, `/investimentos`, `/patrimonio`, `/planejador`, `/connect`, `/relatorio` and `/configuracoes` unchanged.

- [ ] **Step 4: Run route and layout tests**

Run: `pnpm vitest run src/App.test.jsx src/components/avyo/AppLayout.test.jsx`

Expected: PASS with active navigation on canonical paths.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/components/avyo/NavItems.jsx src/components/avyo/RouteNav.jsx
git commit -m "feat: add canonical product routes"
```

### Task 3: Criar os contratos locais de IA, sanitização e fallback

**Files:**
- Create: `src/lib/aiPayloads.js`
- Create: `src/lib/aiPayloads.test.js`
- Create: `src/services/ai/AiProvider.js`
- Create: `src/services/ai/AiProvider.test.js`
- Create: `src/services/ai/LocalAiFallback.js`
- Create: `src/services/ai/AiContext.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `AI_CAPABILITIES`, `AiProviderError`, `createAiProvider({ invoke, timeoutMs })`, `buildPlannerPayload`, `buildMonthlyReportPayload`, `buildStatementPayload`, `localAiFallback` and `useAi()`.
- Consumes: `aggregateFinance`, `buildInsights`, `buildMonthlyReport`.

- [ ] **Step 1: Write payload privacy and timeout tests**

```js
it('sends only aggregated planner fields', () => {
  const payload = buildPlannerPayload(state, 'Como reduzir gastos?')
  expect(payload).toEqual(expect.objectContaining({ question: 'Como reduzir gastos?' }))
  expect(JSON.stringify(payload)).not.toContain('Marina')
  expect(JSON.stringify(payload)).not.toContain('tx-salario')
  expect(payload.summary.categories).toBeInstanceOf(Array)
})

it('maps timeout to a stable provider error', async () => {
  vi.useFakeTimers()
  const provider = createAiProvider({ invoke: () => new Promise(() => {}), timeoutMs: 15000 })
  const pending = provider.answerPlanner({ question: 'Oi', summary: {} })
  await vi.advanceTimersByTimeAsync(15001)
  await expect(pending).rejects.toMatchObject({ code: 'timeout' })
})
```

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/lib/aiPayloads.test.js src/services/ai/AiProvider.test.js`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement the provider contract**

```js
export const AI_CAPABILITIES = ['planner', 'monthly-report', 'statement-parser']

export class AiProviderError extends Error {
  constructor(code, message, cause) { super(message); this.name = 'AiProviderError'; this.code = code; this.cause = cause }
}

export function createAiProvider({ invoke, timeoutMs = 15000 }) {
  const call = async (capability, input, options = {}) => {
    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout
    try { return await invoke(capability, input, { signal }) }
    catch (error) {
      if (signal.aborted) throw new AiProviderError('timeout', 'A IA demorou mais que o esperado.', error)
      throw new AiProviderError('unavailable', 'A IA está indisponível.', error)
    }
  }
  return {
    answerPlanner: (input, options) => call('planner', input, options),
    generateMonthlyReport: (input, options) => call('monthly-report', input, options),
    parseStatement: (input, options) => call('statement-parser', input, options),
  }
}
```

Sanitizers return only these shapes:

```js
export const buildPlannerPayload = (state, question, history = []) => ({
  question: String(question).slice(0, 800),
  history: history.slice(-6).map(({ role, text }) => ({ role, text: String(text).slice(0, 800) })),
  summary: summarizeFinance(state),
})
export const buildMonthlyReportPayload = (finance, insights) => ({
  totals: pick(finance, ['income', 'expenses', 'result', 'reserve', 'netWorth']),
  topCategories: topCategories(finance.spentByCategory, 3),
  insights: insights.slice(0, 5).map(({ title, description }) => ({ title, description })),
})
export const buildStatementPayload = (text, metadata = {}) => ({
  text: String(text).slice(0, 50000),
  format: ['csv', 'ofx', 'text'].includes(metadata.format) ? metadata.format : 'text',
})
```

- [ ] **Step 4: Implement fallback and React provider**

```jsx
export const localAiFallback = {
  answerPlanner: async ({ question, summary }) => ({ mode: 'local', text: answerLocally(question, summary), facts: [], actions: [] }),
  generateMonthlyReport: async ({ totals, insights }) => ({ mode: 'local', summary: buildLocalSummary(totals), attention: insights.slice(0, 3), nextSteps: [] }),
  parseStatement: async ({ text }) => ({ mode: 'local', rows: parseCsv(text), warnings: ['Revise os dados antes de importar.'] }),
}

export function AiProviderRoot({ children, provider = localAiFallback }) {
  return <AiContext.Provider value={provider}>{children}</AiContext.Provider>
}
```

Wrap application providers with `AiProviderRoot`; no Base44 import is introduced in this task.

- [ ] **Step 5: Run contract tests and commit**

Run: `pnpm vitest run src/lib/aiPayloads.test.js src/services/ai/AiProvider.test.js`

Expected: PASS.

```bash
git add src/lib/aiPayloads.js src/lib/aiPayloads.test.js src/services/ai src/App.jsx
git commit -m "feat: isolate AI contracts and local fallbacks"
```

### Task 4: Inicializar o backend-only Base44 e criar três funções stateless

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `base44/config.jsonc`
- Create: `base44/functions/_shared/http.ts`
- Create: `base44/functions/_shared/safety.ts`
- Create: `base44/functions/ai-planner/function.jsonc`
- Create: `base44/functions/ai-planner/index.ts`
- Create: `base44/functions/ai-monthly-report/function.jsonc`
- Create: `base44/functions/ai-monthly-report/index.ts`
- Create: `base44/functions/ai-statement-parser/function.jsonc`
- Create: `base44/functions/ai-statement-parser/index.ts`
- Create: `src/services/ai/Base44AiProvider.js`
- Create: `src/services/ai/Base44AiProvider.test.js`

**Interfaces:**
- Produces: `base44AiProvider` matching Task 3.
- Backend responses: planner `{ text, facts, actions }`; report `{ summary, attention, nextSteps }`; parser `{ rows, warnings }`.

- [ ] **Step 1: Prepare CLI exactly once**

Read `base44-cli/references/create.md` completely before creation, then run:

```bash
pnpm add -D base44
npx base44 whoami
npx base44 create avyo-ai-gateway -p . -t backend-only --no-skills
```

Expected: authenticated email, `base44/config.jsonc` and linked project metadata. If `whoami` reports unauthenticated, run `npx base44 login`, let the user complete the device flow, and rerun `npx base44 whoami` before `create`.

- [ ] **Step 2: Read the SDK skill after initialization**

Confirm `base44/config.jsonc` exists, then read `base44-sdk/SKILL.md` and only the linked function/integration references required for `functions.invoke` and `integrations.Core.InvokeLLM`.

- [ ] **Step 3: Write adapter contract tests**

```js
it('maps capabilities to the only three Base44 functions', async () => {
  const invoke = vi.fn().mockResolvedValue({ data: { text: 'Resposta', facts: [], actions: [] } })
  const provider = createBase44AiProvider({ functions: { invoke } })
  await provider.answerPlanner({ question: 'Posso economizar?', summary: {} })
  expect(invoke).toHaveBeenCalledWith('ai-planner', expect.any(Object), expect.any(Object))
  expect(new Set(invoke.mock.calls.map(([name]) => name))).toEqual(new Set(['ai-planner']))
})
```

- [ ] **Step 4: Create shared request guards**

```ts
export function requireJson(req: Request, maxBytes: number) {
  const length = Number(req.headers.get('content-length') || 0)
  if (length > maxBytes) return Response.json({ error: 'payload_too_large' }, { status: 413 })
  if (!req.headers.get('content-type')?.includes('application/json')) return Response.json({ error: 'invalid_content_type' }, { status: 415 })
  return null
}

export const SAFETY_PROMPT = `Você é um educador financeiro. Não movimente dinheiro, não prometa retorno, não prescreva produto financeiro e deixe explícito que cenários são educativos.`
```

- [ ] **Step 5: Implement the three Base44 handlers with fixed JSON schemas**

Each `index.ts` must: accept POST only; apply `requireJson`; validate whitelisted keys and length; call `base44.integrations.Core.InvokeLLM({ prompt, response_json_schema })`; return only the declared response shape. The planner schema is:

```ts
const response_json_schema = {
  type: 'object', additionalProperties: false, required: ['text', 'facts', 'actions'],
  properties: {
    text: { type: 'string', maxLength: 2400 },
    facts: { type: 'array', maxItems: 5, items: { type: 'string', maxLength: 180 } },
    actions: { type: 'array', maxItems: 3, items: {
      type: 'object', additionalProperties: false, required: ['label', 'route'],
      properties: { label: { type: 'string', maxLength: 80 }, route: { enum: ['/movimentacoes/transacoes', '/planejamento/orcamento', '/metas', '/reserva', '/ate-pagamento'] } },
    } },
  },
}
```

Report uses three bounded string arrays; parser rows require `date`, `description`, `amount`, `type`, `category` and cap at 500 items. No handler imports an entity API or writes to storage.

- [ ] **Step 6: Implement the sole SDK adapter**

```js
export function createBase44AiProvider(client) {
  return createAiProvider({
    invoke: async (capability, input, { signal }) => {
      const names = { planner: 'ai-planner', 'monthly-report': 'ai-monthly-report', 'statement-parser': 'ai-statement-parser' }
      const response = await client.functions.invoke(names[capability], input, { signal })
      return response.data
    },
  })
}
```

- [ ] **Step 7: Verify types, functions and adapter**

Run:

```bash
npx base44 types generate
npx base44 functions deploy ai-planner ai-monthly-report ai-statement-parser
pnpm vitest run src/services/ai/Base44AiProvider.test.js
```

Expected: type generation succeeds, exactly three functions deploy, adapter test passes. Do not run `base44 site deploy`.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml base44 src/services/ai/Base44AiProvider.js src/services/ai/Base44AiProvider.test.js
git commit -m "feat: add stateless Base44 AI gateway"
```

### Task 5: Fortalecer dialogs, vazio e CRUD compartilhado

**Files:**
- Modify: `src/components/avyo/RecordDialog.jsx`
- Modify: `src/components/avyo/ConfirmDialog.jsx`
- Create: `src/components/avyo/EmptyState.jsx`
- Create: `src/components/avyo/AiDisclosure.jsx`
- Create: `src/components/avyo/Dialog.test.jsx`

**Interfaces:**
- Produces: editable `RecordDialog({ initial, fields, onSave })`, keyboard-safe confirmation, `EmptyState`, `AiDisclosure({ accepted, onAccept })`.

- [ ] **Step 1: Write dialog behavior tests**

```jsx
it('hydrates edit fields and closes with Escape', async () => {
  const onClose = vi.fn()
  render(<RecordDialog open title="Editar" initial={{ name: 'Conta' }} fields={[{ name: 'name', label: 'Nome' }]} onSave={vi.fn()} onClose={onClose} />)
  expect(screen.getByLabelText('Nome')).toHaveValue('Conta')
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalledOnce()
})
```

- [ ] **Step 2: Run test and confirm red**

Run: `pnpm vitest run src/components/avyo/Dialog.test.jsx`

Expected: FAIL because edit hydration/Escape handling is incomplete.

- [ ] **Step 3: Implement shared interaction contracts**

```jsx
useEffect(() => { if (open) setForm(initial) }, [open, initial])
useEffect(() => {
  if (!open) return undefined
  const close = (event) => event.key === 'Escape' && onClose()
  document.addEventListener('keydown', close)
  return () => document.removeEventListener('keydown', close)
}, [open, onClose])
```

Set `aria-labelledby`, autofocus the first input, restore trigger focus on close, and expose explicit button labels `Editar <item>` and `Excluir <item>` in consuming pages.

- [ ] **Step 4: Run test and commit**

Run: `pnpm vitest run src/components/avyo/Dialog.test.jsx`

Expected: PASS.

```bash
git add src/components/avyo/RecordDialog.jsx src/components/avyo/ConfirmDialog.jsx src/components/avyo/EmptyState.jsx src/components/avyo/AiDisclosure.jsx src/components/avyo/Dialog.test.jsx
git commit -m "feat: standardize accessible CRUD interactions"
```

### Task 6: Completar as quatro janelas de Movimentações

**Files:**
- Modify: `src/pages/TransactionsPage.jsx`
- Modify: `src/pages/TransactionsPage.test.jsx`
- Modify: `src/pages/CardsPage.jsx`
- Create: `src/pages/CardsPage.test.jsx`
- Modify: `src/pages/InstallmentsPage.jsx`
- Create: `src/pages/InstallmentsPage.test.jsx`
- Modify: `src/pages/SubscriptionsPage.jsx`
- Modify: `src/pages/SubscriptionsPage.test.jsx`
- Modify: `src/components/avyo/CsvImportDialog.jsx`
- Modify: `src/components/avyo/CardVisual.jsx`
- Create: `src/components/avyo/InstallmentTimeline.jsx`

**Interfaces:**
- Consumes: generic CRUD commands, `useAi().parseStatement`, payload sanitizer and shared dialogs.
- Produces: complete create/edit/delete flows and explicit statement review before import.

- [ ] **Step 1: Write one end-to-end component test per page**

```jsx
it('filters, edits and deletes a transaction', async () => {
  renderFinance(<TransactionsPage />)
  await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'expense')
  await userEvent.click(screen.getByRole('button', { name: /Editar Mercado do bairro/i }))
  await userEvent.clear(screen.getByLabelText('Descrição'))
  await userEvent.type(screen.getByLabelText('Descrição'), 'Mercado semanal')
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
  expect(screen.getByText('Mercado semanal')).toBeInTheDocument()
})
```

Add assertions for card linked-installment details, installment future total/timeline and subscription monthly/annual totals plus empty states.

- [ ] **Step 2: Run movement tests and confirm red**

Run: `pnpm vitest run src/pages/TransactionsPage.test.jsx src/pages/CardsPage.test.jsx src/pages/InstallmentsPage.test.jsx src/pages/SubscriptionsPage.test.jsx`

Expected: FAIL on missing filters, edit/delete controls, details and totals.

- [ ] **Step 3: Implement transaction summary, filters and import modes**

```jsx
const visible = state.transactions.filter((item) =>
  (type === 'all' || item.type === type) && (category === 'all' || item.category === category)
)
const totals = visible.reduce((sum, item) => sum + (item.type === 'income' ? Number(item.amount) : -Number(item.amount)), 0)
```

CSV recognized by the local parser goes directly to review. OFX/text shows `Interpretar com IA · Usa Base44`; clicking it requires disclosure, calls `parseStatement`, keeps file text on error and falls back to manual mapping.

- [ ] **Step 4: Implement card, installment and subscription CRUD**

```js
const monthlyCommitted = state.cards.reduce((sum, card) => sum + Number(card.currentBill || 0), 0)
const futureInstallments = state.installments.reduce((sum, item) => sum + Number(item.monthlyValue || 0) * Number(item.remainingMonths || 0), 0)
const monthlySubscriptions = state.subscriptions.filter((item) => item.active).reduce((sum, item) => sum + Number(item.monthlyValue || 0), 0)
```

Use institution-derived stable themes, a card details dialog filtered by `cardId`, and prefill `cardId` when opening a new installment from a card.

- [ ] **Step 5: Run movement tests and commit**

Run: `pnpm vitest run src/pages/TransactionsPage.test.jsx src/pages/CardsPage.test.jsx src/pages/InstallmentsPage.test.jsx src/pages/SubscriptionsPage.test.jsx`

Expected: PASS.

```bash
git add src/pages/TransactionsPage.jsx src/pages/TransactionsPage.test.jsx src/pages/CardsPage.jsx src/pages/CardsPage.test.jsx src/pages/InstallmentsPage.jsx src/pages/InstallmentsPage.test.jsx src/pages/SubscriptionsPage.jsx src/pages/SubscriptionsPage.test.jsx src/components/avyo/CsvImportDialog.jsx src/components/avyo/CardVisual.jsx src/components/avyo/InstallmentTimeline.jsx
git commit -m "feat: complete movement management flows"
```

### Task 7: Atualizar a janela Início

**Files:**
- Create: `src/lib/dashboard.js`
- Create: `src/lib/dashboard.test.js`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/HomePage.test.jsx`
- Modify: `src/components/avyo/SituationHero.jsx`
- Modify: `src/components/avyo/PulseCard.jsx`
- Modify: `src/components/avyo/MonthSummary.jsx`
- Modify: `src/components/avyo/NextActions.jsx`

**Interfaces:**
- Produces: `buildDashboard(state, month): { situation, pulse, indicators, journeys }`.

- [ ] **Step 1: Write dashboard view-model tests**

```js
it('shows plan balances and three fixed journeys', () => {
  const view = buildDashboard(createInitialState(), monthKey())
  expect(view.situation).toEqual(expect.objectContaining({ committed: expect.any(Number), free: expect.any(Number) }))
  expect(view.indicators.map((item) => item.key)).toEqual(['result', 'income', 'expenses', 'protection', 'netWorth'])
  expect(view.journeys.map((item) => item.title)).toEqual(['Organizar', 'Proteger e planejar', 'Crescer'])
})
```

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/lib/dashboard.test.js src/pages/HomePage.test.jsx`

Expected: FAIL because the view model and five-indicator layout do not exist.

- [ ] **Step 3: Implement and render the dashboard view model**

```js
export function buildDashboard(state, month) {
  const finance = aggregateFinance(state, month)
  const plan = state.atePagamento?.status === 'active' ? calculateUntilPayday(state.atePagamento) : null
  const score = calculatePulse(finance, state)
  return {
    situation: { total: plan?.balance ?? finance.result, committed: plan?.committed ?? 0, free: plan?.remainingFree ?? finance.result },
    pulse: { score, label: score >= 80 ? 'Muito saudável' : score >= 60 ? 'Em evolução' : 'Pede atenção' },
    indicators: buildFiveIndicators(finance, state),
    journeys: buildThreeJourneys(state),
  }
}
```

Pulse title must be `AVYO Pulse — X/100`, use Framer Motion respecting `prefers-reduced-motion`, and show one contextual CTA. The setup invitation renders only when there is no active plan.

- [ ] **Step 4: Run tests and commit**

Run: `pnpm vitest run src/lib/dashboard.test.js src/pages/HomePage.test.jsx`

Expected: PASS.

```bash
git add src/lib/dashboard.js src/lib/dashboard.test.js src/pages/HomePage.jsx src/pages/HomePage.test.jsx src/components/avyo/SituationHero.jsx src/components/avyo/PulseCard.jsx src/components/avyo/MonthSummary.jsx src/components/avyo/NextActions.jsx
git commit -m "feat: enrich the AVYO home dashboard"
```

### Task 8: Completar Orçamento, Metas e Reserva

**Files:**
- Create: `src/lib/budgets.js`
- Create: `src/lib/budgets.test.js`
- Modify: `src/pages/BudgetsPage.jsx`
- Create: `src/pages/BudgetsPage.test.jsx`
- Modify: `src/pages/GoalsPage.jsx`
- Create: `src/pages/GoalsPage.test.jsx`
- Modify: `src/pages/EmergencyReservePage.jsx`
- Create: `src/pages/EmergencyReservePage.test.jsx`
- Modify: `src/components/avyo/GoalCard.jsx`
- Modify: `src/components/avyo/ReserveShield.jsx`

**Interfaces:**
- Produces: `buildBudgetRows(state, month)`, goal deposits and independent reserve target/value editing.

- [ ] **Step 1: Write planning tests**

```js
it('includes categories without limits and rounds a three-month suggestion', () => {
  const rows = buildBudgetRows(state, '2026-09')
  expect(rows.find((row) => row.category === 'Saúde')).toMatchObject({ limit: null })
  expect(rows.every((row) => row.suggested % 50 === 0)).toBe(true)
})
```

Add UI tests for quick goal chips (`+ R$ 50`, `+ R$ 100`, `+ R$ 500`), edit/delete, reserve quick deposits and five-column desktop grid.

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/lib/budgets.test.js src/pages/BudgetsPage.test.jsx src/pages/GoalsPage.test.jsx src/pages/EmergencyReservePage.test.jsx`

Expected: FAIL on category completion and missing CRUD/deposit controls.

- [ ] **Step 3: Implement budget calculations**

```js
export function roundedSuggestion(values) {
  const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)
  return Math.ceil(average / 50) * 50
}
```

Aggregate each category over the selected month and two prior months; merge transaction categories with budget categories; represent absent limits as `null`.

- [ ] **Step 4: Implement goal and reserve mutations**

```js
const depositGoal = (goal, amount) => updateRecord('goals', goal.id, { saved: Math.min(Number(goal.total), Number(goal.saved) + amount) })
const depositReserve = (amount) => updateProfile({ reserveAmount: Math.max(0, Number(state.profile.reserveAmount) + amount) })
const updateReserveTarget = ({ essentialCost, monthsGoal }) => updateProfile({ essentialCost: Number(essentialCost), monthsGoal: Number(monthsGoal) })
```

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run src/lib/budgets.test.js src/pages/BudgetsPage.test.jsx src/pages/GoalsPage.test.jsx src/pages/EmergencyReservePage.test.jsx`

Expected: PASS.

```bash
git add src/lib/budgets.js src/lib/budgets.test.js src/pages/BudgetsPage.jsx src/pages/BudgetsPage.test.jsx src/pages/GoalsPage.jsx src/pages/GoalsPage.test.jsx src/pages/EmergencyReservePage.jsx src/pages/EmergencyReservePage.test.jsx src/components/avyo/GoalCard.jsx src/components/avyo/ReserveShield.jsx
git commit -m "feat: complete budgets goals and reserve planning"
```

### Task 9: Evoluir Até o pagamento para wizard e simulação registrável

**Files:**
- Modify: `src/lib/untilPayday.js`
- Modify: `src/lib/untilPayday.test.js`
- Modify: `src/pages/UntilPaydayPage.jsx`
- Modify: `src/pages/UntilPaydayPage.test.jsx`
- Modify: `src/components/avyo/UntilPaydayWizard.jsx`
- Create: `src/components/avyo/PaydayBreakdown.jsx`

**Interfaces:**
- Produces: `detectCommitments(state, untilDate)`, `calculateUntilPayday(plan)`, `simulatePayday(plan, item)`.

- [ ] **Step 1: Write calculation and interaction tests**

```js
it('calculates daily and weekly rhythm after detected and manual commitments', () => {
  const result = calculateUntilPayday({ balance: 2000, plannedItems: [{ amount: 400 }], extraItems: [{ amount: 100 }], safetyReserve: 500, nextPaymentDate: '2026-09-20', today: '2026-09-15' })
  expect(result).toMatchObject({ committed: 500, remainingFree: 1000, dailyRhythm: 200, weeklyRhythm: 1400 })
})
```

Add UI assertions for five wizard stages, paid commitment toggles, today-spent display, expense simulation and extra-income simulation recorded in the plan.

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/lib/untilPayday.test.js src/pages/UntilPaydayPage.test.jsx`

Expected: FAIL on new fields, weekly rhythm and staged wizard.

- [ ] **Step 3: Implement deterministic plan math**

```js
const activeItems = [...(plannedItems || []), ...(extraItems || [])].filter((item) => !(paidItemIds || []).includes(item.id))
const committed = activeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
const remainingFree = Number(balance) + Number(extraIncome || 0) - committed - Number(safetyReserve || 0) - Number(todaySpent || 0)
return { days, committed, remainingFree, dailyRhythm: remainingFree / days, weeklyRhythm: remainingFree / days * 7, status: remainingFree < 0 ? 'critical' : remainingFree / days < 50 ? 'attention' : 'healthy' }
```

- [ ] **Step 4: Implement wizard and What If recording**

Persist normalized plan with `extraItems`, `paidItemIds`, `todaySpent`, `createdAt`; expense recording appends a negative-margin item, while extra income appends an income item. Both actions update the same local plan and show a toast.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run src/lib/untilPayday.test.js src/pages/UntilPaydayPage.test.jsx`

Expected: PASS.

```bash
git add src/lib/untilPayday.js src/lib/untilPayday.test.js src/pages/UntilPaydayPage.jsx src/pages/UntilPaydayPage.test.jsx src/components/avyo/UntilPaydayWizard.jsx src/components/avyo/PaydayBreakdown.jsx
git commit -m "feat: expand the until-payday planner"
```

### Task 10: Construir as sete abas de Investimentos

**Files:**
- Create: `src/lib/investments.js`
- Create: `src/lib/investments.test.js`
- Modify: `src/pages/InvestmentsPage.jsx`
- Modify: `src/pages/InvestmentsPage.test.jsx`
- Modify: `src/components/avyo/InvestmentPortfolio.jsx`
- Modify: `src/components/avyo/SuitabilityQuiz.jsx`
- Create: `src/components/avyo/AllocationEditor.jsx`
- Create: `src/components/avyo/InvestmentGoals.jsx`
- Modify: `src/components/avyo/NextContribution.jsx`

**Interfaces:**
- Produces: `scoreSuitability(answers)`, `normalizeAllocation(allocation)`, `compareAllocation(current, desired)`.

- [ ] **Step 1: Write domain tests**

```js
it('scores all five suitability dimensions and preserves reasons', () => {
  const result = scoreSuitability({ tolerance: 2, capacity: 3, horizon: 4, liquidity: 1, knowledge: 2, reasons: ['aposentadoria'], priorities: ['segurança'] })
  expect(result).toMatchObject({ profile: 'equilibrado', tolerance: 2, capacity: 3, horizon: 4, reasons: ['aposentadoria'], priorities: ['segurança'] })
})

it('rejects allocation totals other than 100', () => {
  expect(() => normalizeAllocation({ stable: 60, variable: 30 })).toThrow('allocation_total')
})
```

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/lib/investments.test.js src/pages/InvestmentsPage.test.jsx`

Expected: FAIL because the domain module and seven tabs are absent.

- [ ] **Step 3: Implement investment domain functions**

```js
export function scoreSuitability(answers) {
  const score = ['tolerance', 'capacity', 'horizon', 'liquidity', 'knowledge'].reduce((sum, key) => sum + Number(answers[key] || 0), 0)
  const profile = score <= 8 ? 'conservador' : score <= 15 ? 'equilibrado' : 'arrojado'
  return { ...answers, profile, updatedAt: new Date().toISOString() }
}

export function normalizeAllocation(allocation) {
  const total = Object.values(allocation).reduce((sum, value) => sum + Number(value || 0), 0)
  if (total !== 100) throw new Error('allocation_total')
  return allocation
}
```

- [ ] **Step 4: Render the seven named tabs and CRUD**

Use exactly: `Visão geral`, `Minha carteira`, `Encontre meu perfil`, `Distribuição`, `Próximo aporte`, `Objetivos`, `Evolução`. Portfolio uses generic add/update/remove commands; target allocation is local component state persisted inside `investmentProfile.answers.allocation`; goals edit `monthlyInvestmentGoal` and `investmentTotalGoal` on profile.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run src/lib/investments.test.js src/pages/InvestmentsPage.test.jsx`

Expected: PASS, including exact 100% enforcement and educational disclaimer.

```bash
git add src/lib/investments.js src/lib/investments.test.js src/pages/InvestmentsPage.jsx src/pages/InvestmentsPage.test.jsx src/components/avyo/InvestmentPortfolio.jsx src/components/avyo/SuitabilityQuiz.jsx src/components/avyo/AllocationEditor.jsx src/components/avyo/InvestmentGoals.jsx src/components/avyo/NextContribution.jsx
git commit -m "feat: add complete investment workspace"
```

### Task 11: Completar Patrimônio e calculadora de projeção

**Files:**
- Modify: `src/pages/NetWorthPage.jsx`
- Modify: `src/pages/NetWorthPage.test.jsx`
- Modify: `src/pages/WealthCalculatorPage.jsx`
- Create: `src/pages/WealthCalculatorPage.test.jsx`
- Modify: `src/lib/projections.js`
- Modify: `src/lib/projections.test.js`
- Modify: `src/components/avyo/NetWorthSummary.jsx`
- Modify: `src/components/avyo/WealthProjectionChart.jsx`

**Interfaces:**
- Produces: protected reserve/investment lines, CRUD for other assets/liabilities and `projectVariableContributions(input)`.

- [ ] **Step 1: Write formula, protected-row and variable-contribution tests**

```js
it('projects a schedule of changing monthly contributions', () => {
  const points = projectVariableContributions({ initial: 1000, annualRate: 0.10, months: 3, contributions: [100, 200, 300] })
  expect(points).toHaveLength(4)
  expect(points.at(-1).contributed).toBe(600)
})
```

Add UI assertions for `ativos − passivos = patrimônio líquido`, reserve/investment links, blocked delete buttons on protected rows, scenario labels `6%`, `10%`, `15%`, months/years toggle and disclaimer.

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/lib/projections.test.js src/pages/NetWorthPage.test.jsx src/pages/WealthCalculatorPage.test.jsx`

Expected: FAIL on protected rows and variable contribution projection.

- [ ] **Step 3: Implement projection and protected-row composition**

```js
export function projectVariableContributions({ initial, annualRate, months, contributions }) {
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1
  let balance = Number(initial); let contributed = 0
  const points = [{ month: 0, balance, contributed }]
  for (let month = 1; month <= months; month += 1) {
    const contribution = Number(contributions[month - 1] ?? contributions.at(-1) ?? 0)
    contributed += contribution
    balance = balance * (1 + monthlyRate) + contribution
    points.push({ month, balance, contributed })
  }
  return points
}
```

Protected rows derive from `profile.reserveAmount` and investment current values and link to `/reserva` and `/investimentos`; do not duplicate them into `assets`.

- [ ] **Step 4: Run tests and commit**

Run: `pnpm vitest run src/lib/projections.test.js src/pages/NetWorthPage.test.jsx src/pages/WealthCalculatorPage.test.jsx`

Expected: PASS.

```bash
git add src/pages/NetWorthPage.jsx src/pages/NetWorthPage.test.jsx src/pages/WealthCalculatorPage.jsx src/pages/WealthCalculatorPage.test.jsx src/lib/projections.js src/lib/projections.test.js src/components/avyo/NetWorthSummary.jsx src/components/avyo/WealthProjectionChart.jsx
git commit -m "feat: enrich net worth and projection tools"
```

### Task 12: Converter Meu Planejador em chat Base44 com fallback local

**Files:**
- Modify: `src/pages/PlannerPage.jsx`
- Modify: `src/pages/PlannerPage.test.jsx`
- Create: `src/components/avyo/PlannerChat.jsx`
- Create: `src/components/avyo/PlannerMessage.jsx`

**Interfaces:**
- Consumes: `useAi().answerPlanner`, `buildPlannerPayload`, `settings` and four aggregate indicators.
- Session state: `{ id, role: 'user'|'assistant', text, mode?: 'base44'|'local', actions?: [] }[]`; never persisted.

- [ ] **Step 1: Write chat tests**

```jsx
it('sends sanitized context and labels fallback mode', async () => {
  const answerPlanner = vi.fn().mockRejectedValue(new Error('offline'))
  renderPlanner({ answerPlanner })
  await userEvent.type(screen.getByLabelText('Pergunte ao AVYO'), 'Como organizar o mês?')
  await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))
  expect(answerPlanner).toHaveBeenCalledWith(expect.not.objectContaining({ profile: expect.anything() }), expect.any(Object))
  expect(await screen.findByText('modo local')).toBeInTheDocument()
})
```

Add tests for four indicators, suggestion chips, loading state, preserved typed text on failure and no `localStorage.setItem` for messages.

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/pages/PlannerPage.test.jsx`

Expected: FAIL because the page is a timeline rather than chat.

- [ ] **Step 3: Implement disclosure-aware chat**

```jsx
const send = async () => {
  const question = draft.trim(); if (!question) return
  const userMessage = { id: createId('message'), role: 'user', text: question }
  setMessages((items) => [...items, userMessage]); setStatus('loading')
  const payload = buildPlannerPayload(state, question, messages)
  try {
    const reply = await ai.answerPlanner(payload, { signal: controller.signal })
    setMessages((items) => [...items, { id: createId('message'), role: 'assistant', mode: 'base44', ...reply }])
  } catch {
    const reply = await localAiFallback.answerPlanner(payload)
    setMessages((items) => [...items, { id: createId('message'), role: 'assistant', ...reply }])
  } finally { setStatus('idle') }
}
```

Do not clear `draft` until the request has been accepted into the message list. Auto-scroll the message region after append and respect reduced motion.

- [ ] **Step 4: Run tests and commit**

Run: `pnpm vitest run src/pages/PlannerPage.test.jsx`

Expected: PASS.

```bash
git add src/pages/PlannerPage.jsx src/pages/PlannerPage.test.jsx src/components/avyo/PlannerChat.jsx src/components/avyo/PlannerMessage.jsx
git commit -m "feat: turn the planner into a private AI chat"
```

### Task 13: Completar Connect e Aprender

**Files:**
- Modify: `src/pages/ConnectPage.jsx`
- Create: `src/pages/ConnectPage.test.jsx`
- Modify: `src/pages/SchoolPage.jsx`
- Create: `src/pages/SchoolPage.test.jsx`
- Modify: `src/pages/CalculatorsPage.jsx`
- Create: `src/pages/CalculatorsPage.test.jsx`
- Modify: `src/pages/HelpPage.jsx`
- Create: `src/pages/HelpPage.test.jsx`
- Modify: `src/components/avyo/LessonDialog.jsx`

**Interfaces:**
- Connect persists only v2 profile fields.
- Learning pages use canonical `RouteNav` and local calculations only.

- [ ] **Step 1: Write Connect and learning tests**

```jsx
it('connects, edits and disconnects local business data', async () => {
  renderFinance(<ConnectPage />)
  await fillBusiness({ proLabore: 4000, profitDistribution: 2000, businessPersonalExpenses: 500, businessNetWorth: 80000 })
  await userEvent.click(screen.getByRole('button', { name: 'Conectar dados locais' }))
  expect(screen.getByText(/PF \+ PJ/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Desconectar' }))
  expect(screen.getByRole('button', { name: 'Conectar dados locais' })).toBeInTheDocument()
})
```

Add tests for lesson progress, calculator explicit `Calcular` action/result explanation, FAQ search and accordion `aria-expanded`.

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/pages/ConnectPage.test.jsx src/pages/SchoolPage.test.jsx src/pages/CalculatorsPage.test.jsx src/pages/HelpPage.test.jsx`

Expected: FAIL on missing business fields and explicit learning interactions.

- [ ] **Step 3: Implement Connect profile commands**

```js
updateProfile({
  hasBusiness: true, businessConnected: true,
  proLabore: Number(form.proLabore), profitDistribution: Number(form.profitDistribution),
  businessPersonalExpenses: Number(form.businessPersonalExpenses), businessNetWorth: Number(form.businessNetWorth),
})
```

Disconnect sets `businessConnected: false` and retains entered values for recoverability; the consolidated panel derives PF + PJ locally. Copy states clearly that company data is not sent unless the user includes aggregates in a Planner question.

- [ ] **Step 4: Implement consistent learning interactions**

Each learning page renders the learning subnav. Calculators hold inputs separately from results and update results only on `Calcular`. FAQ buttons control panels via `aria-controls` and `aria-expanded`.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run src/pages/ConnectPage.test.jsx src/pages/SchoolPage.test.jsx src/pages/CalculatorsPage.test.jsx src/pages/HelpPage.test.jsx`

Expected: PASS.

```bash
git add src/pages/ConnectPage.jsx src/pages/ConnectPage.test.jsx src/pages/SchoolPage.jsx src/pages/SchoolPage.test.jsx src/pages/CalculatorsPage.jsx src/pages/CalculatorsPage.test.jsx src/pages/HelpPage.jsx src/pages/HelpPage.test.jsx src/components/avyo/LessonDialog.jsx
git commit -m "feat: complete local Connect and learning areas"
```

### Task 14: Integrar relatório local/IA e configurações de privacidade

**Files:**
- Modify: `src/pages/ReportPage.jsx`
- Modify: `src/pages/ReportPage.test.jsx`
- Modify: `src/pages/SettingsPage.jsx`
- Modify: `src/pages/SettingsPage.test.jsx`
- Modify: `src/lib/report.js`
- Modify: `src/lib/report.test.js`

**Interfaces:**
- Report consumes `useAi().generateMonthlyReport` only after explicit click.
- Settings controls `aiEnabled`, disclosure and all v2 profile fields.

- [ ] **Step 1: Write report/settings tests**

```jsx
it('renders local report immediately and replaces only narrative after AI click', async () => {
  const generateMonthlyReport = vi.fn().mockResolvedValue({ summary: 'Leitura Base44', attention: [], nextSteps: [] })
  renderReport({ generateMonthlyReport, aiAccepted: true })
  expect(screen.getByText(/Resultado do mês/i)).toBeInTheDocument()
  expect(generateMonthlyReport).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: /Gerar leitura com IA/i }))
  expect(await screen.findByText('Leitura Base44')).toBeInTheDocument()
  expect(screen.getByText(/Resultado do mês/i)).toBeInTheDocument()
})
```

Add tests for top categories, error fallback, print button, no logout, `Dados somente neste navegador`, AI toggles and footer `Versão de validação · 0.2`.

- [ ] **Step 2: Run tests and confirm red**

Run: `pnpm vitest run src/lib/report.test.js src/pages/ReportPage.test.jsx src/pages/SettingsPage.test.jsx`

Expected: FAIL on AI narrative control and v2 settings copy.

- [ ] **Step 3: Implement report mode separation**

```jsx
const [narrative, setNarrative] = useState(localReport)
const generateAiReading = async () => {
  setAiStatus('loading')
  try { setNarrative(await ai.generateMonthlyReport(buildMonthlyReportPayload(finance, insights))); setAiStatus('success') }
  catch { setNarrative(localReport); setAiStatus('error') }
}
```

Charts, totals and top categories always use deterministic local data; only the narrative block changes. Printing calls `window.print()` in either mode.

- [ ] **Step 4: Implement settings sections**

Render avatar initials, editable financial profile, protection reference, investment profile summary, Base44 disclosure controls and local-data notice. Remove logout completely.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm vitest run src/lib/report.test.js src/pages/ReportPage.test.jsx src/pages/SettingsPage.test.jsx`

Expected: PASS.

```bash
git add src/pages/ReportPage.jsx src/pages/ReportPage.test.jsx src/pages/SettingsPage.jsx src/pages/SettingsPage.test.jsx src/lib/report.js src/lib/report.test.js
git commit -m "feat: add opt-in AI reports and privacy settings"
```

### Task 15: Refazer onboarding em três etapas e redirecionar

**Files:**
- Modify: `src/components/avyo/OnboardingDialog.jsx`
- Modify: `src/components/avyo/OnboardingDialog.test.jsx`

**Interfaces:**
- Produces: three-stage flow, skip and completion navigation to `/movimentacoes/transacoes`.
- Persists: only profile/protection data and `onboarded: true`.

- [ ] **Step 1: Write full, skip and preview tests**

```jsx
it('completes three steps and redirects to transactions', async () => {
  renderOnboarding({ onboarded: false })
  expect(screen.getByText('Boas-vindas ao AVYO')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
  expect(screen.getByText(/Organizar/i)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))
  await userEvent.type(screen.getByLabelText('Custo essencial mensal'), '3000')
  await userEvent.click(screen.getByRole('button', { name: 'Começar' }))
  expect(window.location.pathname).toBe('/movimentacoes/transacoes')
})
```

Add a skip test and a live protection preview assertion (`essentialCost * monthsGoal`).

- [ ] **Step 2: Run test and confirm red**

Run: `pnpm vitest run src/components/avyo/OnboardingDialog.test.jsx`

Expected: FAIL because the current flow does not match three stages and redirect.

- [ ] **Step 3: Implement staged animated onboarding**

```jsx
const finish = (profilePatch = {}) => {
  updateProfile({ ...profilePatch, onboarded: true })
  navigate('/movimentacoes/transacoes', { replace: true })
}
```

Use `AnimatePresence`/`motion.section`, preserve keyboard focus on stage change, allow `Pular e configurar depois`, and do not require name or income.

- [ ] **Step 4: Run test and commit**

Run: `pnpm vitest run src/components/avyo/OnboardingDialog.test.jsx`

Expected: PASS.

```bash
git add src/components/avyo/OnboardingDialog.jsx src/components/avyo/OnboardingDialog.test.jsx
git commit -m "feat: guide users through three-step onboarding"
```

### Task 16: Verificação integrada, visual e documentação

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`
- Test: all files in `src/**/*.test.{js,jsx}`

**Interfaces:**
- Produces: reproducible local setup, optional Base44 setup and verified desktop/mobile behavior.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
pnpm test:run
pnpm build
```

Expected: all tests PASS and Vite exits successfully with `dist/` output. Fix any regression by first adding or tightening the focused failing test, then rerun both commands.

- [ ] **Step 2: Audit the Base44 boundary**

Run:

```bash
rg -n "@base44/sdk|base44Client|functions\.invoke" src base44
rg -n "entities\.|auth\.|agents\.|connectors\.|site deploy" src base44
```

Expected: SDK/client invocation appears only in `Base44AiProvider.js` and backend functions; the second search has no runtime matches. Confirm `npx base44 functions list` shows only the three named functions.

- [ ] **Step 3: Run a production preview and inspect every route**

Run: `pnpm vite preview --host 127.0.0.1`

Inspect at 1440×900 and 390×844: home; four movement pages; four planning pages; seven investment tabs; net worth/calculator; planner; Connect; three learning pages; report; settings; onboarding. Verify no horizontal overflow, readable contrast, visible focus, empty states, Escape-safe dialogs, AI disclosure and local fallback by blocking network.

- [ ] **Step 4: Verify retained data and privacy manually**

Seed a v1 document, reload, edit one record in each collection, reload again and confirm ids/values remain. Open browser network tools, use each AI capability and confirm requests contain aggregates/text only; verify planner messages disappear after reload and no remote write requests occur.

- [ ] **Step 5: Document local and optional AI setup**

Add these README sections with exact commands:

```markdown
## Uso local

`pnpm install`, `pnpm dev`, `pnpm test:run` e `pnpm build`.

Os dados financeiros ficam somente na chave `avyo-personal:v1` do navegador.

## IA opcional via Base44

O Base44 é usado somente pelas funções `ai-planner`, `ai-monthly-report` e `ai-statement-parser`. Autentique com `npx base44 login`, confira com `npx base44 whoami` e publique apenas as funções com `npx base44 functions deploy ai-planner ai-monthly-report ai-statement-parser`. O site, os dados e os cálculos continuam locais.
```

- [ ] **Step 6: Commit the verified release**

```bash
git add README.md .gitignore
git commit -m "docs: document AVYO v2 local and AI setup"
git status --short
```

Expected: clean worktree after the final commit.
