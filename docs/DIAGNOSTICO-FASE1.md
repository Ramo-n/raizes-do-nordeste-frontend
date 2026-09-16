# FASE 1 — Diagnóstico do Repositório · Rede Raízes do Nordeste


## 0. Achado principal (bloqueante)

**Não existe projeto Front-End no repositório acessível.**

Repositórios visíveis para o Devin na conta `Ramo-n`:

| Repositório | Linguagem | Situação |
|---|---|---|
| `raizes-do-nordeste-backend` | Java | Clonado e analisado integralmente (é o Back-End da Trilha Back-end 2026) |
| `raizes-do-nordeste` | Java | Listado, mas o clone retorna **404 / not found** (repositório privado sem acesso concedido ao Devin, ou renomeado). Pela linguagem (Java) provavelmente é uma versão anterior do back-end, não um front-end |
| `baozi-store-backend`, `meusite` | Java / HTML | Não relacionados |

Consequência: os itens 3–10 do roteiro de análise ("framework Front-End", "páginas", "componentes", "rotas", "serviços", "chamadas de API", "dados mockados") **não têm o que ser identificado** — o front-end ainda não foi iniciado. Nada foi alterado até agora.

---

## 1. Stack atual (Back-End existente)

- Java 17 · Spring Boot 3.2.5 (Web, Data JPA, Validation, Security)
- JWT HS256 (implementação própria) + BCrypt
- H2 em memória (`ddl-auto: create` + `data.sql`) — dados reiniciam a cada execução
- Swagger/OpenAPI (springdoc 2.5) · JUnit 5 · coleção Postman (15 cenários)
- Build: Maven (`cd backend && mvn spring-boot:run` / `mvn test`)
- **Não há CORS configurado** no `SecurityConfig` → um front-end em outra origem (ex.: `localhost:5173`) seria bloqueado pelo navegador. Isso é relevante para a integração real.

## 2. Estrutura do projeto

```
raizes-do-nordeste-backend/
  backend/            # Spring Boot (domain, repository, service, security, web, config)
  documentacao/       # requisitos, arquitetura, API, plano de testes (trilha back-end)
  entrega/            # DOCX/PDF da entrega da trilha back-end
  postman/            # coleção + ambiente
  README.md
```

Não há: `package.json`, `index.html`, `src/` de front-end, arquivos de lint/CI, pre-commit hooks.

## 3. Funcionalidades existentes (API) que o Front-End pode consumir

| Recurso | Endpoint | Auth |
|---|---|---|
| Login (JWT) | `POST /api/auth/login` `{email, senha}` → `{accessToken, role, email}` | público |
| Unidades | `GET /api/unidades`, `GET /api/unidades/{id}` | JWT |
| Cardápio por unidade | `GET /api/unidades/{id}/cardapio` (só disponíveis no local/período) | JWT |
| Cadastro de cliente | `POST /api/clientes` `{nome, email, dataNascimento?, consentimentoLgpd}` | JWT (!) |
| Consentimento LGPD | `POST /api/clientes/{id}/consentimento` | JWT |
| Anonimização LGPD | `POST /api/clientes/{id}/anonimizacao` | JWT |
| Fidelidade | `GET /api/clientes/{id}/fidelidade` → `{pontos, percentualDesconto, frequenciaConsumo}` | JWT |
| Criar pedido | `POST /api/pedidos` `{unidadeId, clienteId?, canalPedido: APP/TOTEM/WEB/…, itens[]}` → status `AGUARDANDO_PAGAMENTO`, solicita pagamento ao gateway simulado | CLIENTE/ATENDENTE/GERENTE |
| Acompanhar pedido | `GET /api/pedidos/{id}` | JWT |
| Callback pagamento | `POST /api/pagamentos/{pedidoId}/resultado` `{status: CONFIRMADO/RECUSADO}` | **ATENDENTE/GERENTE/MATRIZ** (cliente não pode) |
| Avançar status | `POST /api/pedidos/{id}/avancar` (PAGO→EM_PREPARO→PRONTO→ENTREGUE) | JWT |
| Estoque, auditoria, relatórios | `/api/estoque`, `/api/auditoria`, `/api/relatorios/*` | perfis gerenciais |

Usuários seed: `cliente@raizes.com`, `atendente@`, `gerente@`, `matriz@` (senha `123456`).
Seed de dados: 2 unidades (Recife Centro — cozinha completa; São Paulo Paulista — reduzida), 6 produtos / 6 categorias, cardápio distinto por unidade, 1 cliente com 120 pontos (5% de desconto).

## 4. Lacunas do Back-End em relação ao roteiro Front-End (não serão alteradas sem autorização)

| Lacuna | Impacto no Front-End | Tratamento proposto |
|---|---|---|
| Sem CORS | Chamadas diretas do browser falham | Proxy de dev (Vite) + `service layer` com fallback para Mock |
| `POST /api/clientes` exige JWT e não cria `Usuario`/senha | Cadastro público com senha (RF01) não é possível via API | Cadastro **mockado** no front (`MockAuthService`), com contrato preparado para a API |
| Callback de pagamento só para perfis internos | Cliente não consegue "aprovar" o próprio pagamento | **Gateway externo MOCK no front** (PENDING/APPROVED/DECLINED/ERROR/TIMEOUT), conforme Fase 7 |
| Sem endpoint de promoções/campanhas | RF13 sem fonte de dados | Mock Data de promoções/cupons |
| Sem imagens de produtos | UI de cardápio | Placeholders/ilustrações locais |
| `avancar` sem restrição de perfil | — | Front usa para simular Cozinha (preparo → pronto) na tela de acompanhamento |

## 5. Requisitos do roteiro × situação atual

| Req. | Situação | Observação |
|---|---|---|
| RF01 Cadastro | Parcial (API cria Cliente, sem senha, exige JWT) | Front mock + contrato API |
| RF02 Autenticação | Atendido na API | Front consome `/api/auth/login` (ou mock) |
| RF03 Cardápio por unidade | Atendido na API | Front consome |
| RF04–RF08 Seleção/detalhe/carrinho | Não existe (é UI) | Implementar no front (estado local) |
| RF09 Pedido | Atendido na API | Front consome / mock |
| RF10 Acompanhamento | Atendido na API | Front consome + polling/simulação |
| RF11–RF12 Fidelidade/pontos | Atendido na API | Front consome / mock |
| RF13 Promoções | **Não existe** | Mock Data |
| RF14–RF16 Pagamento externo + retorno visual + confirmação | Parcial (gateway simulado gera só referência; resultado depende de callback interno) | Gateway MOCK no front com estados |
| RF17 Integração conceitual Back-End | Existe API real | Camada `services/api` + documentação |
| RF18 Integração conceitual pagamento | Interface `PagamentoGateway` no back | Espelhar no front (`PaymentGateway` interface → `MockPaymentGateway`) |
| RNF01–RNF10 | Não aplicável (sem front) | Implementar |
| LGPD na interface | Não existe (só back) | Banner, consentimento, política, minimização |
| Casos de uso / jornada / wireframes / plano de testes / matriz (front) | Não existem | Produzir na pasta de documentação do front |

## 6. Problemas encontrados

1. Ausência total do front-end (bloqueante para decidir **onde** criar).
2. Repositório `Ramo-n/raizes-do-nordeste` inacessível ao Devin.
3. Sem CORS no back-end.
4. Ambiente da máquina: Java 17 presente; **Maven e Node.js ausentes** (instaláveis; não afeta a decisão).

## 7. Necessidades identificadas

- **Mock Data**: unidades, categorias, produtos (com `disponivel=false` em pelo menos um), promoções/cupons, clientes/usuários, pontos/benefícios, pedidos, status, pagamentos (cenários aprovado/recusado/erro/timeout).
- **Páginas**: Início, Seleção de Unidade, Cardápio, Detalhe do Produto, Carrinho, Login, Cadastro, Fidelidade, Promoções, Checkout (revisão + retirada + LGPD), Pagamento (estados), Confirmação, Acompanhamento, Política de Privacidade, 404.
- **Componentes**: Header, Navigation, Footer, UnitSelector, CategoryMenu, ProductCard, ProductDetails, Cart, CartItem, LoginForm, RegisterForm, LoyaltyCard, PromotionCard, Checkout, PaymentStatus, OrderStatus, LoadingState, EmptyState, ErrorState, Modal, Toast, ConsentBanner/PrivacyNotice, ChannelSwitcher (WEB/APP/TOTEM).
- **Arquitetura**: `pages/ · components/ · services/ (api + mock, mesma interface) · mocks/ · store (contexts: auth, cart, unit, toast) · hooks/ · types/ · styles (design tokens, mobile-first) · tests/`.

---

## 8. PLANO DE IMPLEMENTAÇÃO (proposto)

**Stack proposta** (decisão de projeto, a confirmar): **React 18 + TypeScript + Vite**, React Router, CSS Modules/CSS puro com tokens (sem UI-kit), Vitest + Testing Library, ESLint. Justificativa: permitido pelo roteiro, leve, build estático publicável (GitHub Pages/Vercel/Netlify), componentização nativa, boa acessibilidade com HTML semântico.

| Etapa | Entrega |
|---|---|
| 1 | Scaffold Vite + estrutura de pastas, design tokens mobile-first, layout (Header/Nav/Footer), roteamento, modo de canal WEB/APP/TOTEM (`data-channel`) |
| 2 | Camada de serviços: interfaces `UnitService`, `MenuService`, `AuthService`, `OrderService`, `LoyaltyService`, `PromotionService`, `PaymentGateway`; implementações **Mock** (padrão) e **Api** (Spring Boot, via proxy) selecionáveis por `VITE_DATA_SOURCE` |
| 3 | Mock Data centralizado (`src/mocks/*.ts`) com cenários de erro/indisponibilidade |
| 4 | Fluxo do cliente: Início → Unidade → Cardápio (categorias, loading/empty/error, indisponível) → Detalhe → Carrinho (qtd, remover, vazio) |
| 5 | Autenticação: Login/Cadastro com validação, LGPD (consentimento, finalidade dos dados, minimização), Política de Privacidade, banner de privacidade |
| 6 | Checkout: revisão, fidelidade/promoção (cupom inválido), forma de retirada, validação de dados obrigatórios |
| 7 | Pagamento MOCK: `PENDING → APPROVED / DECLINED / ERROR / TIMEOUT`, mensagens exigidas, nova tentativa; confirmação do pedido |
| 8 | Acompanhamento: `CONFIRMADO → EM_PREPARO → PRONTO → RETIRADO` com simulação temporal e retorno visual |
| 9 | Fidelidade e Promoções (páginas + cards) |
| 10 | Acessibilidade (semântica, foco, teclado, aria-live, contraste, toque ≥ 44px), responsividade, modo TOTEM |
| 11 | Testes automatizados (Vitest/RTL) cobrindo os 17 cenários obrigatórios + lint + build |
| 12 | Documentação acadêmica (14 seções), casos de uso UC1–UC13, diagrama de casos de uso e jornada (Mermaid), wireframes (Mermaid/ASCII + capturas), plano de testes, matriz de rastreabilidade, README de execução/publicação |
| 13 | Auditoria dos 100 pontos, checklist final e relatório final |

## 9. Decisão necessária antes de prosseguir

Onde o front-end deve viver?

- **A)** Pasta `frontend/` dentro de `raizes-do-nordeste-backend` (monorepo; PR único; back-end intocado)
- **B)** Novo repositório `raizes-do-nordeste-frontend` (o usuário precisa criá-lo no GitHub e conceder acesso ao Devin)
- **C)** O repositório `Ramo-n/raizes-do-nordeste` já é o front-end → conceder acesso ao Devin para reanálise
