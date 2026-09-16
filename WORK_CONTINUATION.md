# AVYO Personal v2 — Work Continuation Checkpoint

**Data do checkpoint:** 2026-09-16  
**Repositório:** `NicholasAlencar/avyo-personal`  
**Branch de continuidade:** `feature/avyo-v2-base44-ai`  
**Commit de integração das Tasks 6–16:** `f9143fae204eed8e60fe48d154abf64d2953eab5`  
**PR final de integração:** #11 — `AVYO Personal v2 — Final integration (Tasks 6–16)`  

> Este arquivo existe para permitir que o ChatGPT Work/Codex continue exatamente do ponto atual sem reconstruir o projeto, sem reabrir decisões já aprovadas e sem reintroduzir mocks que foram removidos.

## 1. Estado atual

A AVYO Personal v2 foi consolidada na branch `feature/avyo-v2-base44-ai`.

A sequência das **Tasks 6–16** foi integrada nessa branch. A `main` foi mantida intacta e não deve ser alterada sem autorização explícita do usuário.

O merge final ocorreu por meio do PR #11. O commit de merge foi:

```text
f9143fae204eed8e60fe48d154abf64d2953eab5
```

Antes do merge, o último commit funcional verificado era:

```text
86ec30101f9ba5801eee1a41a488a267739b2e61
```

O GitHub Actions final desse commit foi:

```text
Run: 35147011419
Status: SUCCESS
```

Nesse pipeline passaram:

- `pnpm test:run`
- `pnpm verify:boundary`
- `pnpm build`

A suíte completa estava verde, com 40 arquivos de teste e 139 testes na última contagem completa.

## 2. Decisão arquitetural que NÃO pode ser desfeita

O AVYO Personal é **local-first**.

Persistência financeira continua exclusivamente no navegador via `localStorage`, usando:

```text
avyo-personal:v1
```

O documento interno é `version: 2`.

Nenhum dado financeiro deve ser gravado remotamente.

### Base44 é permitido somente como fronteira opcional de IA

As únicas capacidades autorizadas são:

- `ai-planner`
- `ai-monthly-report`
- `ai-statement-parser`

O único bridge frontend permitido é:

```text
src/services/ai/Base44AiProvider.js
```

Nenhum outro componente de domínio deve importar ou chamar Base44 diretamente.

Não usar Base44 para:

- Auth
- Entities
- Agents
- Connectors
- Hosting como requisito funcional do produto
- armazenamento remoto de dados financeiros

Toda transmissão para IA exige simultaneamente:

```js
settings.aiEnabled === true
settings.aiDisclosureAccepted === true
```

Os payloads precisam continuar sanitizados, sem IDs internos, e-mail, nomes pessoais ou notas livres irrelevantes.

Timeout das chamadas de IA: 15 segundos.

Falha de IA nunca pode apagar ou substituir dados locais do usuário.

## 3. AVYO Connect — comportamento aprovado e obrigatório

Este é um ponto crítico.

O Connect **NÃO deve simular integração local**.

Foi encontrada e corrigida uma regressão em que a Task 13 havia introduzido:

- formulário de pró-labore;
- distribuição de lucros;
- patrimônio empresarial;
- botão `Conectar dados locais`;
- visão `PF + PJ` simulada.

Esse comportamento foi removido porque contradizia a decisão aprovada anteriormente.

### Estado correto do Connect

O Connect deve aparecer como um benefício/integração futura e permanecer **bloqueado até existir backend real do AVYO Empresas**.

Não criar:

- conexão local fake;
- botão que sugira conexão real sem backend;
- `businessConnected: true` por interação fictícia;
- painel PF + PJ alimentado por dados simulados;
- sincronização empresarial fake.

A interface deve explicar de forma honesta que a integração automática ainda não está disponível.

Importação local de movimentações, quando aplicável, continua separada e não significa AVYO Connect.

## 4. Tasks concluídas

### Task 6 — Movimentações

Concluído:

- Transações
- Cartões
- Parcelamentos
- Assinaturas
- CRUDs
- estados vazios
- resumos
- fluxo de importação de extrato

### Task 7 — Home / Dashboard

Concluído:

- cinco indicadores principais;
- valores disponível, comprometido/protegido e livre até pagamento;
- AVYO Pulse contextual;
- trilhas `Organizar`, `Proteger e planejar`, `Crescer`;
- insights preservados.

### Task 8 — Planejamento, metas e reserva

Concluído:

- orçamento;
- metas;
- reserva de emergência;
- sugestões;
- aportes rápidos;
- CRUDs locais.

### Task 9 — Até receber

Concluído:

- wizard de cinco etapas;
- compromissos detectados localmente;
- marcação de pagos;
- ritmo diário/semanal;
- simulações de despesas e entradas extras.

### Task 10 — Investimentos

Concluído workspace com:

- visão geral;
- carteira;
- suitability;
- distribuição;
- próximo aporte;
- objetivos;
- evolução.

Suitability é educativo. Não prescrever produtos específicos como recomendação individualizada.

### Task 11 — Patrimônio

Concluído:

- patrimônio líquido;
- ativos e passivos;
- reserva e investimentos protegidos na composição;
- calculadora de futuro;
- cenários de 6%, 10% e 15%;
- meses/anos;
- aportes variáveis.

### Task 12 — Meu Planejador

Concluído:

- chat privado por sessão;
- histórico não persistido;
- quatro indicadores locais;
- chips de sugestão;
- payload sanitizado;
- IA Base44 opcional somente após consentimento;
- fallback local determinístico.

### Task 13 — Aprender + Connect

Aprender concluído:

- Escola AVYO;
- progresso;
- calculadoras;
- FAQ/ajuda;
- interações acessíveis.

Connect: manter **bloqueado**, conforme seção 3 deste documento.

### Task 14 — Relatórios e privacidade

Concluído:

- relatório local determinístico;
- receitas;
- despesas;
- resultado;
- top 3 categorias;
- narrativa de IA somente por ação explícita;
- fallback local;
- impressão;
- configurações de consentimento;
- exclusão/restauração de dados locais.

Controles de IA:

- `Habilitar IA opcional`
- `Aceito o envio de dados agregados`

Desabilitar IA também deve remover a aceitação de disclosure.

### Task 15 — Onboarding v2

Concluído onboarding em três etapas:

1. `Boas-vindas ao AVYO`
2. `Organizar sem complicar`
3. `Construa sua proteção`

Não exigir nome nem renda.

Permitir `Pular e configurar depois`.

Meta de proteção:

```text
custo essencial mensal × meses de proteção
```

Conclusão leva para:

```text
/movimentacoes/transacoes
```

### Task 16 — Release verification

Concluído:

- wiring real do Base44 provider opcional;
- fallback local quando `VITE_BASE44_APP_ID` não existir;
- script `scripts/verifyBase44Boundary.js`;
- `pnpm verify:boundary`;
- CI atualizado;
- `.env.example`;
- documentação de privacidade e arquitetura;
- smoke tests de todas as rotas canônicas.

## 5. Rotas canônicas

As 19 rotas que precisam continuar funcionando são:

```text
/
/movimentacoes/transacoes
/movimentacoes/cartoes
/movimentacoes/parcelamentos
/movimentacoes/assinaturas
/planejamento/orcamento
/planejamento/metas
/reserva
/ate-pagamento
/investimentos
/patrimonio
/patrimonio/calculadora
/planejador
/connect
/aprender/escola
/aprender/calculadoras
/aprender/ajuda
/relatorio
/configuracoes
```

Aliases antigos continuam redirecionando para as rotas canônicas.

## 6. O que ainda NÃO foi feito

Estas pendências não devem ser confundidas com falhas de implementação já resolvidas.

### 6.1 Inspeção visual manual real

Ainda precisa ser executada em navegador real nos viewports:

```text
1440 × 900
390 × 844
```

Validar especialmente:

- overflow horizontal;
- textos cortados;
- cards desalinhados;
- navegação mobile;
- sidebar/menu;
- dialogs;
- inputs;
- tabelas/listas;
- empty states;
- gráficos;
- onboarding;
- relatório;
- configurações;
- Connect bloqueado.

### 6.2 DevTools / Network

Em navegador real, confirmar:

- nenhuma transmissão financeira remota durante uso normal local;
- nenhuma chamada Base44 sem opt-in duplo;
- somente o bridge autorizado usando Base44;
- nenhuma tentativa silenciosa de sincronização do Connect.

### 6.3 Base44 backend

O código está preparado para as três funções, mas o deploy real das funções não foi executado neste checkpoint.

Funções previstas:

```text
ai-planner
ai-monthly-report
ai-statement-parser
```

Não fazer deploy de outras funções para contornar a arquitetura.

### 6.4 Comparação com branch visual online da Base44

Referência que o usuário havia fornecido:

```text
https://app.base44.com/apps/6a9f6bd79ddfce0fde589478/editor/preview?branch=redesign-avyo-personal
```

O código GitHub é Base44-derived, mas o branch online acima não foi submetido a uma comparação visual 1:1 final após todas as Tasks.

Se o Work tiver acesso ao Base44, pode fazer essa comparação sem substituir o GitHub como fonte de continuidade.

## 7. Como continuar no Work

Ao retomar, não recrie o projeto.

Comece assim:

```bash
git fetch origin
git checkout feature/avyo-v2-base44-ai
git pull origin feature/avyo-v2-base44-ai
corepack enable
pnpm install --frozen-lockfile
pnpm test:run
pnpm verify:boundary
pnpm build
```

Depois execute o app local e faça a inspeção visual/manual descrita na seção 6.

Se houver bug visual ou funcional:

1. reproduzir;
2. identificar a causa raiz;
3. criar teste regressivo quando aplicável;
4. corrigir de forma mínima;
5. rodar suíte completa;
6. rodar `pnpm verify:boundary`;
7. rodar build;
8. registrar evidência antes de declarar concluído.

## 8. Regras para próximos agentes

- Não começar do zero.
- Não trocar a fonte de verdade sem necessidade.
- Não mexer na `main` sem autorização explícita.
- Não remover a arquitetura local-first.
- Não enviar dados financeiros para servidor por padrão.
- Não transformar Base44 em backend geral do produto.
- Não reintroduzir Connect fake/local.
- Não afirmar inspeção visual se ela não tiver sido realmente executada.
- Não afirmar deploy Base44 se as funções não tiverem sido realmente publicadas.
- Não marcar como verde sem verificar testes, boundary e build após mudanças de código.

## 9. Prompt curto para o Work retomar

Use este texto como ponto de partida:

> Continue o AVYO Personal v2 a partir da branch `feature/avyo-v2-base44-ai` do repositório `NicholasAlencar/avyo-personal`. Leia `WORK_CONTINUATION.md` antes de alterar qualquer arquivo. Não recrie Tasks 6–16. Preserve arquitetura local-first, boundary Base44 e Connect bloqueado até existir backend real. Primeiro rode testes, `verify:boundary` e build. Depois faça inspeção visual real em 1440×900 e 390×844, valide as 19 rotas canônicas e DevTools/Network, corrija apenas problemas comprovados e registre evidências. Não faça merge em `main` sem autorização explícita.

---

**Este arquivo é o checkpoint oficial de continuidade do AVYO Personal v2 para o próximo ciclo de Work.**
