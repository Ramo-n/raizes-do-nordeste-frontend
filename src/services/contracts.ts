import type {
  CanalPedido,
  Categoria,
  Cliente,
  CredenciaisLogin,
  Fidelidade,
  ItemCardapio,
  NovoCliente,
  NovoPedido,
  Pagamento,
  Pedido,
  Promocao,
  ResultadoPagamento,
  Sessao,
  SolicitacaoPagamento,
  StatusGatewayPagamento,
  Unidade,
} from '@/types'

/**
 * Contratos da camada de serviços. Existem duas implementações:
 *  - `services/mock`  → Mock Data em memória/localStorage (demonstração acadêmica)
 *  - `services/api`   → chamadas HTTP ao Back-End Spring Boot
 * A escolha é feita em `services/index.ts` via `VITE_DATA_SOURCE`.
 */

export interface UnidadeService {
  listar(): Promise<Unidade[]>
  obter(id: number): Promise<Unidade>
}

export interface CardapioService {
  listarCategorias(): Promise<Categoria[]>
  cardapioDaUnidade(unidadeId: number): Promise<ItemCardapio[]>
  obterItem(unidadeId: number, produtoId: number): Promise<ItemCardapio>
}

export interface AuthService {
  login(credenciais: CredenciaisLogin): Promise<Sessao>
  cadastrar(dados: NovoCliente): Promise<Sessao>
  sessaoAtual(): Sessao | null
  sair(): void
}

export interface ClienteService {
  obter(id: number): Promise<Cliente>
  registrarConsentimento(clienteId: number): Promise<Cliente>
  solicitarAnonimizacao(clienteId: number): Promise<void>
}

export interface FidelidadeService {
  consultar(clienteId: number): Promise<Fidelidade>
}

export interface ResultadoValidacaoPromocao {
  valida: boolean
  promocao: Promocao | null
  desconto: number
  motivo?: string
}

export interface PromocaoService {
  listar(unidadeId?: number): Promise<Promocao[]>
  validar(codigo: string, ctx: { unidadeId: number; canal: CanalPedido; subtotal: number }): Promise<ResultadoValidacaoPromocao>
}

export interface PedidoService {
  criar(novo: NovoPedido): Promise<Pedido>
  obter(id: number): Promise<Pedido>
  listar(filtro?: { clienteId?: number; unidadeId?: number }): Promise<Pedido[]>
  /** Avança o status operacional (PAGO → EM_PREPARO → PRONTO → ENTREGUE). Uso: atendente/cozinha. */
  avancarStatus(id: number): Promise<Pedido>
  /** Informa ao Back-End o resultado retornado pelo gateway externo. */
  registrarResultadoPagamento(pedidoId: number, referenciaExterna: string, status: StatusGatewayPagamento): Promise<Pedido>
}

/**
 * Gateway externo de pagamento (RF14/RF18). A interface é agnóstica ao provedor:
 * trocar o MOCK por uma API real exige apenas uma nova implementação.
 */
export interface PaymentGateway {
  nomeProvedor(): string
  solicitarPagamento(solicitacao: SolicitacaoPagamento, signal?: AbortSignal): Promise<ResultadoPagamento>
}

export interface PagamentoService {
  /** Orquestra: solicita ao gateway, aplica timeout, registra resultado no pedido. */
  pagar(solicitacao: SolicitacaoPagamento, onEstado?: (estado: StatusGatewayPagamento | 'REQUESTED') => void): Promise<Pagamento>
  historico(pedidoId: number): Promise<Pagamento[]>
}

export interface Servicos {
  unidades: UnidadeService
  cardapio: CardapioService
  auth: AuthService
  clientes: ClienteService
  fidelidade: FidelidadeService
  promocoes: PromocaoService
  pedidos: PedidoService
  pagamentos: PagamentoService
}
