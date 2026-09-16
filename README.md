# AVYO Personal

Aplicação local-first de finanças pessoais baseada na experiência do AVYO Personal criada no Base44. O app organiza receitas, despesas, compromissos, orçamento, metas, reserva, investimentos, patrimônio e cenários sem depender de armazenamento financeiro remoto.

## Arquitetura

- React + Vite + Tailwind CSS.
- Estado financeiro persistido exclusivamente no `localStorage`, na chave `avyo-personal:v1`, com documento interno `version: 2`.
- Operações financeiras, CRUD, cálculos, projeções, relatórios-base e navegação funcionam localmente/offline.
- Base44 é opcional e fica restrito a três funções stateless de IA:
  - `ai-planner`
  - `ai-monthly-report`
  - `ai-statement-parser`
- Nenhuma Entity, Auth, Agent, Connector ou armazenamento financeiro do Base44 é usado.
- Sem `VITE_BASE44_APP_ID`, o aplicativo continua funcional e usa fallback local para os recursos assistidos.

## Executar

Requer Node.js 22 ou superior e pnpm via Corepack.

```bash
corepack enable
pnpm install
pnpm dev
```

Acesse o endereço exibido pelo Vite. Na primeira abertura, o onboarding pode ser preenchido ou pulado. A demonstração pode ser restaurada posteriormente em Configurações.

## Verificar

```bash
pnpm test:run
pnpm build
```

O GitHub Actions executa a mesma validação em branches de trabalho e finalização.

## Base44 opcional

Copie `.env.example` para `.env.local` e informe apenas o App ID público do gateway Base44:

```bash
VITE_BASE44_APP_ID=seu_app_id
```

O adaptador do frontend é `src/services/ai/Base44AiProvider.js`. Ele é a única fronteira do SDK Base44 no código de aplicação e mapeia exatamente as três capacidades acima.

As funções ficam em `base44/functions/`. Para trabalhar no gateway, use o CLI já configurado no projeto e faça deploy somente das funções necessárias. Não é necessário fazer deploy de site pelo Base44 para executar o frontend local.

## Dados e privacidade

- Dados financeiros ficam neste navegador.
- CSV é interpretado localmente.
- OFX/texto pode usar a leitura assistida somente após consentimento explícito.
- Planejador e narrativa mensal enviam apenas resumos sanitizados e necessários à solicitação.
- Payloads removem nome, email e identificadores internos.
- Conversas do Planejador não são persistidas no `localStorage`.
- Se Base44 estiver ausente ou indisponível, o fluxo retorna ao fallback local.
- Configurações permite revogar IA/consentimento, restaurar a demonstração ou apagar os dados locais.

## Importação de movimentações

Na página **Transações**, CSV passa pelo parser local e por uma prévia antes da confirmação. Cabeçalhos reconhecidos incluem `data/date`, `descricao/histórico/memo`, `valor/amount`, `tipo/type` e `categoria/category`. Datas `DD/MM/AAAA` e `AAAA-MM-DD` e valores com vírgula decimal são aceitos.

Para OFX ou texto não estruturado, o usuário pode escolher **Interpretar com IA**. O conteúdo original é preservado se a interpretação falhar e existe caminho de revisão manual.

## Áreas do produto

- Início com situação financeira, AVYO Pulse, cinco indicadores e jornadas.
- Movimentações: Transações, Cartões, Parcelamentos e Assinaturas.
- Planejamento: Orçamento, Metas, Reserva de Emergência e Até receber.
- Investimentos com sete visões, suitability educativo, distribuição e objetivos.
- Patrimônio com ativos/passivos, referências protegidas e calculadora de futuro.
- Planejador local com conversa IA opcional e transitória.
- AVYO Connect para consolidação manual PF + PJ local.
- Aprender: Escola AVYO, Calculadoras e Ajuda.
- Relatório mensal local com narrativa IA opcional.
- Configurações de perfil, proteção, investimento, privacidade e dados locais.

## Segurança financeira

O AVYO Personal é uma ferramenta educacional e de organização. Ele não movimenta dinheiro, não promete rentabilidade, não prescreve produtos financeiros e não substitui orientação profissional. Projeções e cenários são hipóteses matemáticas para planejamento.
