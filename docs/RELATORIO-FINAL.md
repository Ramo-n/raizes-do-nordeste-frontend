# Relatório Final — Front-End Rede Raízes do Nordeste

Projeto Multidisciplinar · Trilha Front-End · 2026. Data das verificações: 15/09/2026.
Documento complementar à `docs/DOCUMENTACAO-ACADEMICA.md` (14 seções, casos de uso, diagramas, wireframes, plano de testes, matriz).

## 1. Resumo executivo

Foi entregue uma SPA React + TypeScript que cobre o fluxo completo do cliente (unidade → cardápio → produto → carrinho → login/cadastro com LGPD → checkout com fidelidade/promoção → pagamento MOCK com PENDING/APPROVED/DECLINED/ERROR e retry → confirmação → acompanhamento em preparo/pronto → retirada), além de painel operacional (atendente/cozinha/gerente), programa de fidelidade, promoções, área do cliente com direitos LGPD e três canais (WEB, APP, TOTEM) na mesma base de código. A camada de dados é intercambiável entre MOCK (`localStorage`) e a API real do Back-End Spring Boot já existente. Qualidade verificada: typecheck, lint, build, 34 testes automatizados e fluxo ponta a ponta em navegador (24 telas, 0 erros de console).

**Ponto de partida.** Não existia repositório Front-End acessível ao assistente (o caminho local informado e o repositório GitHub não estavam disponíveis). O projeto foi criado do zero, alinhado ao Back-End `raizes-do-nordeste-backend` analisado na Fase 1 (`diagnostico-fase1.md`). O projeto foi versionado em repositório GitHub público e publicado no GitHub Pages.

**Não é um sistema de produção.** Pagamento, cozinha e persistência são simulados; ver §22–§23 e §27.

## 2. Stack utilizada

| Item | Versão | Justificativa |
|---|---|---|
| React | 18.3 | framework permitido no roteiro; componentização e ecossistema |
| TypeScript (strict) | 5.6 | contratos explícitos com o Back-End; erros em tempo de compilação |
| Vite | 7.3 | build rápido, proxy `/api`, code-splitting por rota |
| React Router DOM | 7.18 | rotas aninhadas, lazy loading |
| Vitest + Testing Library + jsdom | 4.1 / 16 | testes de serviços, reducer e componentes |
| ESLint 9 + typescript-eslint + react-hooks/refresh | 9 | padronização |
| CSS puro com design tokens | — | sem dependência de UI kit; controle total de acessibilidade e canais |
| Node | 22.7.0 local / 22.12.0 CI | — |

Sem bibliotecas de estado, formulário ou UI adicionais (RNF03; regra "não instalar dependências desnecessárias").

## 3. Estrutura do projeto

```
src/
  components/   auth, cardapio, carrinho, fidelidade, layout, lgpd, pagamento, pedido, promocoes, ui, unidade
  config/       env.ts (VITE_DATA_SOURCE, VITE_API_URL, latências/timeout)
  data/mock/    unidades, categorias, produtos, promocoes, clientes, pedidos (centralizado)
  hooks/        useAsync (loading/success/empty/error + polling)
  pages/        18 páginas (uma por rota)
  routes/       AppRoutes.tsx (lazy), paths.ts (ROTAS)
  services/     contracts.ts (interfaces), errors.ts, mock/, api/, http/, payment/ (PaymentGateway + MockPaymentGateway)
  store/        Auth, Cart, Unit, Toast, Channel (Context + reducer)
  styles/       tokens.css (design tokens), global.css (mobile-first, data-canal)
  test/         setup.ts, helpers.ts
  types/        modelos espelhando o domínio do Back-End
  utils/        async, format, storage, validation
docs/           DOCUMENTACAO-ACADEMICA.md, RELATORIO-FINAL.md
```

## 4. Funcionalidades implementadas

RF01 cadastro com validação e consentimento; RF02 login/logout com sessão persistida; RF03 cardápio por unidade com preços/variações regionais e unidade fechada; RF04/RF05 categorias, busca, detalhes com ingredientes/alérgenos/tempo; RF06–RF08 carrinho com limite de quantidade e troca de unidade; RF09 checkout com retirada (balcão/mesa/agendado), revisão e validações; RF10 acompanhamento com polling, linha do tempo e código de retirada; RF11/RF12 fidelidade (pontos, níveis BRONZE/PRATA/OURO, desconto automático, histórico) condicionada a consentimento; RF13 promoções por unidade/canal/período com código validado; RF14–RF16 pagamento via `PagamentoService → PaymentGateway(MOCK)`, estados e textos exigidos, retry, confirmação; RF17 `services/api` + `httpClient` + proxy; RF18 gateway substituível por configuração. Painel operacional (UC10) para avançar status e confirmar retirada. LGPD: banner, política, consentimento, finalidade por campo, exportação/revogação/anonimização na conta. Canais WEB/APP/TOTEM via `ChannelContext` e `data-canal`.

## 5. Funcionalidades que já existiam

Nenhuma no Front-End (projeto novo). O Back-End já possuía: unidades, cardápio por unidade, clientes com consentimento, fidelidade, promoções, pedidos, auth JWT, H2/Swagger — o Front-End espelha esses contratos e não o altera.

## 6. Arquivos criados

Todos os arquivos do projeto (107). Principais além da árvore em §3: `README.md`, `docs/DOCUMENTACAO-ACADEMICA.md`, `docs/RELATORIO-FINAL.md`, `index.html`, `vite.config.ts`, `eslint.config.js`, `tsconfig*.json`, `public/favicon.svg`, cinco arquivos de teste em `__tests__/`.

## 7. Arquivos modificados

Não se aplica ao Back-End (nenhum arquivo alterado). No Front-End, correções relevantes durante a verificação: `src/utils/async.ts` e `src/services/payment/MockPaymentGateway.ts` (timeout real), `src/hooks/useAsync.ts` (polling não volta a LOADING), `src/pages/PagamentoPage.tsx` (cancelar temporizador de redirecionamento ao desmontar), `src/styles/global.css` (sobreposições em mobile).

## 8. Integrações

- **Back-End (conceitual, RF17):** `VITE_DATA_SOURCE=api` ativa `services/api` sobre `httpClient` (JWT Bearer, mapeamento de erros HTTP → `AppError`), proxy Vite `/api → http://localhost:8080`. Contratos em `services/contracts.ts` são os mesmos para MOCK e API.
- **Pagamento externo (conceitual, RF18):** interface `PaymentGateway`; hoje `MockPaymentGateway`. Um adaptador real implementa a mesma interface sem mudar UI.
- **Sem integrações reais** de pagamento, e-mail, push ou mapas.

## 9. Mock data

Centralizado em `src/data/mock/`: 4 unidades (uma fechada), 8 categorias, produtos com preço/variação por unidade, sazonais e esgotados, 5 promoções (uma expirada, uma restrita a canal), 6 contas demo (cliente com/sem consentimento, atendente, gerente, matriz), pedidos históricos, status e pagamentos. Persistência em `localStorage` (`mockDb.ts`) com `reiniciarDb()`. Nenhum dado mock dentro de componentes.

## 10. Pagamento MOCK

Fluxo: `PagamentoPage → PagamentoServiceImpl → PaymentGateway (Mock) → ResultadoPagamento → registrarResultadoPagamento → UI`. Estados de domínio PENDING/APPROVED/DECLINED/ERROR; estados de UI IDLE/REQUESTED/PENDING/APPROVED/DECLINED/ERROR com textos "Pagamento solicitado", "Processando pagamento...", "Pagamento aprovado", "Pagamento recusado", "Erro ao processar pagamento". Cenários selecionáveis em modo MOCK: Aprovar, Recusar, Erro do serviço, Timeout (`AbortSignal`). Recusa/erro mantêm o pedido em AGUARDANDO_PAGAMENTO e permitem nova tentativa (histórico numerado). Nenhum dado de cartão é solicitado.

## 11. LGPD

Banner de privacidade (aceite persistido), página de política, consentimento explícito no cadastro (obrigatório para a conta, com finalidade), fidelidade opt-in separada, finalidade informada campo a campo, minimização (nome, e-mail, senha; telefone opcional), área da conta com exportar dados, revogar consentimento e anonimizar (encerra sessão, bloqueia login e fidelidade). Regras espelham `consentimentoLgpd` do Back-End.

## 12. Responsividade

Mobile-first (base 390 px), breakpoints 768/1024/1366 px em `global.css`; navegação inferior no APP, cabeçalho tradicional no WEB, TOTEM com fonte/alvos maiores, sem navegação global e barra "Modo totem". Canal por `?canal=`/seletor/persistência. Verificado em 390×844 e 1366×768 (screenshots do E2E) e por teste de componentes.

## 13. Acessibilidade

HTML semântico (`header/nav/main/footer`, `h1` por página), `label` associado a todo campo, `aria-describedby`/`aria-invalid` em erros, `role="alert"`/`aria-live` em toasts e status, foco visível, navegação por teclado, alvos ≥ 44 px, estados indicados por texto + ícone (não só cor), `aria-label` em botões icônicos. Sem auditoria automatizada (axe) — limitação declarada.

## 14–16. Casos de uso, jornada e wireframes

UC01–UC13 descritos no formato do roteiro; diagrama de casos de uso (5 atores) e jornada (decisões, loops, integração externa) em Mermaid; 14 wireframes textuais mobile + desktop. UC11–UC13 são representados (dados e regras existem, sem tela de edição) e isso está declarado. Ver `DOCUMENTACAO-ACADEMICA.md` §5–§9.

## 17. Plano de testes

CT01–CT17 (17 cenários obrigatórios, positivos e negativos, com mensagens de erro esperadas) + E2E, no formato ID / objetivo / pré-condição / ação / esperado / obtido / status (`DOCUMENTACAO-ACADEMICA.md` §12).

## 18. Testes executados (resultados reais)

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | 0 erros |
| Lint | `npm run lint` | 0 erros, 0 avisos |
| Unitários/componentes | `npm test` | 5 arquivos, **34 testes aprovados**, 0 falhas |
| Build | `npm run build` | sucesso; bundle principal 246,6 kB (79 kB gzip) + chunks por rota |
| E2E navegador (Playwright + Chrome headless, script externo ao repositório) | fluxo completo mobile + rotas auxiliares + desktop + TOTEM + painel | **24 telas OK, 0 erros/avisos de console** |

Defeitos encontrados pelos testes e corrigidos: (1) cenário TIMEOUT resolvia imediatamente (clamp de `setTimeout`); (2) temporizador de redirecionamento pós-aprovação não era cancelado ao sair da `PagamentoPage`, devolvendo o usuário à confirmação ao clicar rapidamente em "Acompanhar pedido". Nenhum teste foi ajustado para mascarar falhas.

## 19. Resultado do build

`vite build` gera `dist/` com `index.html`, CSS único e JS dividido por página (lazy). Build reproduzível a partir de `npm ci`.

## 20. Matriz de rastreabilidade

Ver `DOCUMENTACAO-ACADEMICA.md` §12 (RF01–RF18, RNF, LGPD → UC → jornada → tela → implementação → teste).

## 21. Requisitos atendidos

RF01–RF16 implementados e testados; RF17/RF18 atendidos conceitualmente conforme exigido (camada API real + gateway substituível). RNF01–RNF10 atendidos. LGPD visível na interface. Multicanal WEB/APP/TOTEM.

## 22. Requisitos parcialmente atendidos

- UC11–UC13 (gerenciar cardápio/promoções/fidelidade): regras e dados existem, painel exibe informações, mas não há telas de edição administrativa.
- RNF07 acessibilidade: práticas aplicadas manualmente; sem auditoria automatizada.
- Modo API: código escrito contra o Back-End analisado, mas não executado contra o servidor nesta entrega (validação feita em modo MOCK).

## 23. Requisitos pendentes

- Testes E2E versionados no repositório (o script Playwright usado ficou fora do projeto para não adicionar dependência).

## 24. Como executar

```bash
npm install
npm run dev            # http://localhost:5173 — modo MOCK (padrão)
# Modo API (Back-End em http://localhost:8080):
VITE_DATA_SOURCE=api npm run dev
```
Contas demo e variáveis em `README.md`.

## 25. Como fazer o build

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run preview        # serve dist/ localmente
```

## 26. Como publicar

SPA estática: publicar `dist/` em Vercel/Netlify/GitHub Pages. Configurar fallback para `index.html` (Netlify: `_redirects` → `/* /index.html 200`; Vercel: `rewrites`). Em GitHub Pages ajustar `base` no `vite.config.ts`. Para modo API em produção definir `VITE_DATA_SOURCE=api` e `VITE_API_URL` (com CORS no Back-End).

## 27. Pontos que ainda precisam ser feitos

2. Executar o modo API contra o Back-End e ajustar eventuais divergências de payload.
3. Telas de gestão (UC11–UC13) para gerente/matriz.
4. Gateway de pagamento real (PIX) atrás de `PaymentGateway`; webhooks de status.
5. Notificações (push/WebSocket) para "pedido pronto".
5. Auditoria automatizada de acessibilidade e testes E2E versionados.
6. Recuperação de senha, observações por item, agendamento com horários reais.
