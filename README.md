# AVYO Personal

Aplicação local-first de finanças pessoais. O AVYO organiza receitas, despesas, cartões, compromissos, orçamento, reserva, metas, investimentos e patrimônio em uma experiência única, com cálculos e respostas locais no navegador.

## Uso local

Requer Node.js 22 ou superior e pnpm via Corepack.

```bash
corepack enable
pnpm install
pnpm dev
```

Para verificar o projeto:

```bash
pnpm test:run
pnpm verify:boundary
pnpm build
```

Os dados financeiros ficam somente na chave `avyo-personal:v1` do navegador. O app não depende de autenticação, banco de dados remoto ou escrita de dados financeiros em servidor para funcionar.

## Dados e privacidade

- Transações, cartões, parcelamentos, assinaturas, orçamentos, metas, reserva, investimentos, patrimônio, perfil e configurações são persistidos localmente.
- O histórico do **Meu Planejador** existe apenas durante a sessão da tela e não é salvo no `localStorage`.
- O AVYO Connect armazena apenas agregados PJ informados pelo próprio usuário; não acessa Open Finance, conta bancária ou contabilidade.
- A IA remota fica bloqueada nesta versão. Planejador, relatório e interpretação disponível usam somente o fallback local.
- Nenhum contexto financeiro é enviado às funções Base44 pelo aplicativo publicado enquanto login e proteção autenticada de backend não existirem.
- Configurações permite restaurar a demonstração ou apagar os dados deste navegador.

## Gateway Base44 reservado para integração autenticada

O repositório preserva as funções `ai-planner`, `ai-monthly-report` e `ai-statement-parser` e seus contratos para uma integração futura. O frontend não cria o provider remoto nem aceita um ID Base44 por variável de ambiente nesta versão.

Liberar essas funções no produto exige login, autorização no backend e proteção contra abuso. Não coloque tokens ou segredos no frontend para contornar essa exigência.

Para autenticar e publicar somente as três funções permitidas:

```bash
npx base44 login
npx base44 whoami
npx base44 functions deploy ai-planner ai-monthly-report ai-statement-parser
```

A fronteira Base44 é verificada por `pnpm verify:boundary`. A checagem impede chamadas frontend fora de `src/services/ai/Base44AiProvider.js`, APIs remotas proibidas e funções backend adicionais às três listadas acima.

### O que pode sair do navegador

Nenhum dado financeiro sai do navegador pela interface atual. Meu Planejador, relatório e importação usam comportamento local. Os contratos de payload sanitizado continuam testados para a futura integração autenticada.

## Importação de CSV

Na página Transações, use **Importar CSV**. O arquivo pode usar vírgula, ponto e vírgula ou tabulação. Cabeçalhos reconhecidos incluem `data`/`date`, `descricao`/`histórico`/`memo`, `valor`/`amount`, `tipo`/`type` e `categoria`/`category`.

Datas podem estar em `DD/MM/AAAA` ou `AAAA-MM-DD`. Valores com vírgula decimal são aceitos. A prévia aparece antes da confirmação.

## Áreas do produto

O AVYO Personal inclui:

- Home com situação financeira, Pulse, cinco indicadores, insights e três jornadas.
- Movimentações: Transações, Cartões, Parcelamentos e Assinaturas.
- Planejamento: Orçamento, Metas, Reserva de Emergência e Até receber.
- Investimentos com perfil, carteira, distribuição, próximo aporte, objetivos, evolução e educação.
- Patrimônio e Calculadora de projeção.
- Meu Planejador com chat privado por sessão e fallback local.
- AVYO Connect em modo local PF + PJ.
- Escola, Calculadoras e Ajuda.
- Relatório mensal com leitura local.
- Configurações de perfil, proteção, investimentos, empresa, privacidade e dados locais.
- Onboarding em três etapas com configuração opcional de proteção.

As projeções, perfis e alocações são ferramentas educativas. Cenários não garantem retornos e o AVYO não movimenta dinheiro nem substitui orientação profissional individualizada.

## Base44 boundary

A arquitetura permite o SDK do Base44 no frontend somente dentro de `src/services/ai/Base44AiProvider.js`. No backend, `base44/functions/` deve conter somente `_shared` e estas três funções:

```text
ai-planner
ai-monthly-report
ai-statement-parser
```

Qualquer ampliação dessa superfície deve ser uma decisão explícita de arquitetura e precisa atualizar a auditoria automatizada antes de ser aceita.
