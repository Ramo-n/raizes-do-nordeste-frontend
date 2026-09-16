# Rede Raízes do Nordeste — Front-End

Aplicação Front-End multicanal (WEB / APP / TOTEM) da Rede Raízes do Nordeste, desenvolvida para o
**Projeto Multidisciplinar – Trilha Front-End – 2026 (Opção B — Codificação/Desenvolvimento)**.

> Esta é uma **simulação acadêmica**: o pagamento é representado por um gateway externo MOCK, nenhum dado
> financeiro real é solicitado ou processado e os dados de demonstração vivem no navegador (`localStorage`).

## Stack

React 18 · TypeScript 5 (strict) · Vite 7 · React Router 7 · Vitest 4 + Testing Library · ESLint 9 · CSS puro com design tokens.

## Como executar

```bash
npm install
npm run dev          # http://localhost:5173  (fonte de dados: MOCK)
```

Para consumir o Back-End Spring Boot (`raizes-do-nordeste-backend`, porta 8080):

```bash
VITE_DATA_SOURCE=api npm run dev   # /api é redirecionado para http://localhost:8080 pelo proxy do Vite
```

Variáveis opcionais (`.env`): `VITE_DATA_SOURCE` (`mock`|`api`), `VITE_API_URL`, `VITE_MOCK_LATENCY_MS`, `VITE_PAYMENT_TIMEOUT_MS`.

## Qualidade

```bash
npm run typecheck    # tsc -b
npm run lint         # eslint .
npm test             # vitest (34 testes)
npm run build        # gera dist/
npm run preview      # serve dist/ localmente
```

## Publicação

`npm run build` gera um site estático em `dist/`, publicável em Vercel, Netlify, GitHub Pages ou qualquer CDN.
Por ser uma SPA, configure o fallback de rotas para `index.html` (ex.: `vercel.json` → `rewrites`, Netlify → `_redirects`: `/* /index.html 200`).

## Contas de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Cliente (BRONZE, 120 pts) | maria@exemplo.com | 123456 |
| Cliente (mesma conta do seed do Back-End) | cliente@raizes.com | 123456 |
| Cliente sem consentimento LGPD | joao@exemplo.com | 123456 |
| Atendente/Cozinha (painel) | atendente@raizes.com | 123456 |
| Gerente (painel) | gerente@raizes.com | 123456 |

Canal: adicione `?canal=TOTEM` (ou `APP`/`WEB`) à URL ou use o seletor no rodapé.
Cenários de pagamento (aprovado / recusado / erro / timeout) são escolhidos na própria tela de pagamento.

## Documentação

- `docs/DOCUMENTACAO-ACADEMICA.md` — 14 seções (requisitos, casos de uso, jornada, wireframes, LGPD, plano de testes, matriz).
- `docs/RELATORIO-FINAL.md` — relatório de entrega (o que foi feito, testes executados, limitações).
