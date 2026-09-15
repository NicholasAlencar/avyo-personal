# AVYO Personal — Evolução detalhada e gateway de IA Base44

## Objetivo

Evoluir o AVYO Personal existente para corresponder ao detalhamento funcional das 20 janelas fornecido pelo usuário. A aplicação permanece independente, local-first e plenamente utilizável sem rede. O Base44 será usado exclusivamente como gateway para recursos de inteligência artificial.

## Princípio de independência

O núcleo do produto não dependerá do Base44:

- React, Vite, Tailwind, componentes, rotas e design system permanecem locais.
- Entidades, perfil e movimentações continuam no documento `avyo-personal:v1` em `localStorage`.
- Cálculos, score, insights, projeções e validações continuam como funções puras locais.
- O app não usará Base44 Auth, Entities, Agents, Hosting, Connectors ou armazenamento remoto.
- O app continuará oferecendo leitura determinística quando estiver offline ou quando a IA falhar.

O uso do Base44 fica restrito a funções sem estado que chamam `integrations.Core.InvokeLLM`. Essas funções não persistem o conteúdo recebido.

## Arquitetura do gateway de IA

### Fronteira no frontend

O frontend consumirá uma interface única em `src/services/ai/AiProvider.js`:

```js
export const AI_CAPABILITIES = ['planner', 'monthly-report', 'statement-parser']

export function createAiProvider({ invoke }) {
  return {
    answerPlanner(input, options),
    generateMonthlyReport(input, options),
    parseStatement(input, options),
  }
}
```

`Base44AiProvider` será o único módulo que importa o SDK do Base44. Componentes e regras de negócio não conhecerão o fornecedor.

### Funções Base44

Serão criadas três funções backend-only:

1. `ai-planner`: recebe pergunta, resumo financeiro sanitizado e histórico curto; retorna resposta estruturada com texto, fatos usados e ações relacionadas.
2. `ai-monthly-report`: recebe totais, tendências e insights locais; retorna resumo, pontos de atenção e próximos passos.
3. `ai-statement-parser`: recebe texto de um arquivo já extraído no navegador; retorna linhas normalizadas para revisão, sem gravá-las.

Cada função validará o payload, limitará tamanho, definirá `response_json_schema` e rejeitará instruções para movimentar dinheiro, prometer retorno ou oferecer aconselhamento profissional individual.

### Dados enviados

O frontend monta payloads mínimos. Não será enviado o documento completo do usuário. Exemplos:

- Planejador: renda, gastos, sobra, compromissos, reserva, patrimônio, categorias agregadas e pergunta.
- Relatório: totais mensais, comparação anterior, três categorias principais e insights determinísticos.
- Extrato: apenas o texto do arquivo escolhido e metadados necessários para interpretação.

Campos de identificação pessoal, ids internos, notas livres não relacionadas e dados de outras telas ficam fora do payload. A interface informará quando um recurso envia dados ao Base44.

### Falhas e fallback

Toda chamada terá timeout, cancelamento por `AbortSignal` e estados `idle`, `loading`, `success` e `error`. Erros não apagarão conteúdo já digitado. O fallback será:

- Planejador: resposta produzida pelo motor determinístico atual.
- Relatório: relatório local atual.
- Importação: parser CSV local e mapeamento manual.

## Rotas e compatibilidade

As rotas canônicas passam a refletir a hierarquia do produto:

- `/movimentacoes/transacoes`, `/movimentacoes/cartoes`, `/movimentacoes/parcelamentos`, `/movimentacoes/assinaturas`
- `/planejamento/orcamento`, `/planejamento/metas`, `/planejamento/reserva`, `/planejamento/ate-pagamento`
- `/aprender/escola`, `/aprender/calculadoras`, `/aprender/ajuda`

As rotas curtas existentes continuarão funcionando por redirecionamento para preservar favoritos e testes. `/reserva`, `/ate-pagamento`, `/investimentos`, `/patrimonio`, `/planejador`, `/connect`, `/relatorio` e `/configuracoes` continuam válidas conforme o detalhamento.

## Evolução por área

### Início

O hero passará a exibir saldo total do plano, valor comprometido e valor livre quando “Até o pagamento” estiver ativo. O Pulse ganhará título `AVYO Pulse — X/100`, frase interpretativa, CTA contextual e animação própria. O resumo mensal terá cinco indicadores: resultado, entradas, gastos, proteção e patrimônio. Próximas ações serão três trilhas fixas — Organizar, Proteger e planejar, Crescer. O convite para configurar “Até o pagamento” aparecerá apenas sem plano ativo.

### Movimentações

Transações ganhará resumo superior, filtros por tipo e categoria, edição, exclusão confirmada, empty state e explicação. A importação continuará local para CSV reconhecível e usará `ai-statement-parser` apenas quando o usuário solicitar interpretação inteligente ou enviar OFX/texto não mapeável.

Cartões ganhará comprometimento mensal, temas por instituição, edição/exclusão e modal de detalhes com parcelas vinculadas. O formulário de parcelamento poderá ser aberto a partir de Cartões. Parcelamentos exibirá timeline visual, total futuro e alerta de comprometimento. Assinaturas ganhará resumo mensal/anual, edição/exclusão e explicação.

### Planejamento

Orçamento mostrará todas as categorias, inclusive sem limite, média de três meses e sugestão arredondada. Metas ganhará chips rápidos, ação “guardar”, edição e exclusão. Reserva terá layout em cinco colunas, escudo preenchido, aportes rápidos e edição separada da meta de proteção.

“Até o pagamento” terá wizard progressivo com saldo, data, despesas manuais, compromissos detectados e reserva. O resultado mostrará ritmo diário e semanal, status, gastos de hoje, breakdown, compromissos e simulação “E se?” capaz de registrar despesa ou renda extra no plano.

### Investimentos

A área terá sete abas: Visão geral, Minha carteira, Encontre meu perfil, Distribuição, Próximo aporte, Objetivos e Evolução. A carteira terá CRUD completo. O teste de suitability avaliará tolerância, capacidade, horizonte, liquidez e conhecimento e persistirá razões/prioridades. Sliders de alocação devem somar 100%; o app comparará atual e desejada sem tratar a referência educacional como recomendação.

### Patrimônio

O topo mostrará a fórmula visual ativos − passivos = patrimônio líquido. Reserva e investimentos serão linhas protegidas com links para suas áreas; demais ativos e passivos terão CRUD. A projeção manterá os cenários de 6%, 10% e 15%, adicionará texto interpretativo e manterá o disclaimer didático. A calculadora permitirá prazo em meses ou anos e aportes variáveis.

### Meu Planejador

O planejador passará de timeline para chat. Mostrará quatro indicadores no topo, sugestões de perguntas, mensagens em bolhas e auto-scroll. Ao enviar, chama `answerPlanner`; durante indisponibilidade usa o motor local e identifica a resposta como “modo local”. Perguntas e respostas ficam apenas na memória da sessão, salvo se o usuário escolher exportar no futuro.

### AVYO Connect

O Connect continuará manual e local. Perfil ganhará campos para pró-labore, distribuição de lucros, gastos pessoais pagos pela empresa, patrimônio empresarial e estado conectado. O painel consolidará PF e PJ, permitirá editar e desconectar e mostrará planos do ecossistema. Nenhum dado empresarial será enviado ao Base44, exceto agregados se o usuário os incluir em uma pergunta do Planejador.

### Aprender, relatório e configurações

Aprender terá subnav consistente, lições com progresso e calculadoras com entradas completas, botão calcular e explicação do resultado. Ajuda usará accordion pesquisável.

Relatório exibirá top categorias e botão “Gerar leitura com IA”. A leitura local aparece de imediato; a versão Base44 substitui apenas o bloco textual quando solicitada. Impressão funciona nos dois modos.

Configurações refletirá o contexto local: avatar, perfil financeiro, referência de proteção, perfil de investimento e rodapé `Versão de validação · 0.2`. Não haverá logout porque o app não usa autenticação. Em seu lugar, haverá indicação “Dados somente neste navegador”.

### Onboarding

O onboarding terá três etapas animadas: boas-vindas, visão das três jornadas e formulário de proteção com preview. Permitirá pular e configurar depois. Como não há autenticação, nome e renda continuam disponíveis em Configurações, mas não bloqueiam a conclusão. Ao terminar, redireciona para Transações.

## Alterações no modelo local

O schema versionado será migrado para `version: 2` sem perda dos dados v1. Serão adicionados:

- `profile.businessConnected`, `businessPersonalExpenses`, `businessNetWorth` e `email` opcional.
- `profile.monthlyInvestmentGoal` e `investmentTotalGoal`.
- `investmentProfile.tolerance`, `capacity`, `horizon`, `reasons`, `priorities`, `updatedAt`.
- `atePagamento.extraItems`, `paidItemIds`, `todaySpent`, `createdAt`.
- `settings.aiEnabled` e `settings.aiDisclosureAccepted`.

A migração preservará coleções, ids e preferências existentes. Conteúdo inválido continuará sendo copiado para a chave de backup antes de restaurar dados demonstrativos.

## Estados de interface

Listas terão estados vazio, carregando somente quando a IA estiver envolvida e erros próximos da ação que falhou. Toasts confirmarão gravações. Dialogs manterão foco, fecharão por Escape quando seguro e pedirão confirmação para exclusões. Botões de IA mostrarão claramente “Usa Base44” e não serão confundidos com cálculos locais.

## Testes

- Migração de schema v1 → v2 sem perda.
- Contrato de rotas canônicas e redirecionamentos.
- Testes unitários do sanitizador de payload e adaptador `AiProvider`.
- Contratos das três funções Base44, incluindo schema de resposta, limites, erros e ausência de persistência.
- Fallback local para Planejador, Relatório e Importação.
- Fluxos de CRUD e estados vazios por área.
- Suitability, soma da alocação, metas de investimento e projeções.
- Wizard, resultado e What If de Até o pagamento.
- Onboarding completo, pular e redirecionamento.
- Suíte existente, build de produção e inspeção visual desktop/mobile.

## Critérios de aceite

1. Todas as janelas e comportamentos descritos no novo detalhamento estão presentes ou adaptados explicitamente ao contexto local.
2. O app funciona sem Base44 para todas as operações não relacionadas à IA.
3. Apenas três capacidades de IA atravessam a fronteira Base44.
4. Nenhum dado financeiro é persistido remotamente pelo código do AVYO.
5. Toda transmissão para IA é explícita, minimizada e possui fallback local.
6. Dados salvos na versão atual migram sem perda.
7. Rotas antigas continuam válidas.
8. Testes e build passam, e os fluxos principais são visualmente verificados.
