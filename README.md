# AVYO Personal

Aplicação local-first de finanças pessoais. Traduz receitas, despesas, compromissos, reserva, investimentos e patrimônio em orientações práticas e fáceis de entender.

## Executar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Acesse o endereço exibido pelo Vite. Na primeira abertura, o app carrega dados demonstrativos para que todas as áreas possam ser exploradas.

## Verificar

```bash
npm run test:run
npm run build
```

## Dados e privacidade

- Não existe backend, Base44 ou recurso de IA.
- Os dados ficam apenas no `localStorage` do navegador, na chave `avyo-personal:v1`.
- Configurações permite restaurar a demonstração ou apagar os dados locais.
- Limpar os dados do navegador também remove as informações do AVYO.

## Importar CSV

Na página Transações, use **Importar CSV**. O arquivo pode usar vírgula, ponto e vírgula ou tabulação. Cabeçalhos reconhecidos incluem:

- `data` ou `date`
- `descricao`, `histórico` ou `memo`
- `valor` ou `amount`
- `tipo` ou `type` (opcional)
- `categoria` ou `category` (opcional)

Datas podem estar em `DD/MM/AAAA` ou `AAAA-MM-DD`. Valores com vírgula decimal são aceitos. A categorização usa palavras-chave locais e a prévia aparece antes da confirmação.

## Áreas

Dashboard, transações, cartões, parcelamentos, assinaturas, orçamento, metas, reserva, plano até receber, investimentos, patrimônio, planejador, escola, calculadoras, relatório mensal, ajuda, Connect e configurações.

As projeções e alocações são simulações educativas; retornos não são garantidos e o app não substitui orientação profissional.
