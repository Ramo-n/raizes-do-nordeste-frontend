/**
 * Tipos de domínio do Front-End.
 *
 * Os nomes e enums seguem os DTOs do Back-End (raizes-do-nordeste-backend, pacote `web.dto.Dtos`)
 * para que a troca da fonte de dados Mock → API não exija alteração nas telas.
 * Campos marcados como "(front)" existem apenas no Front-End (Mock Data) porque o Back-End
 * ainda não os expõe; estão documentados em docs/11-entrega-tecnica.md.
 */

// ---------------------------------------------------------------------------
// Canais e perfis
// ---------------------------------------------------------------------------

/** Canal de atendimento — enum `CanalPedido` do Back-End. */
export type CanalPedido = 'APP' | 'TOTEM' | 'BALCAO' | 'PICKUP' | 'WEB'

/** Canal de interface realmente adaptado pela aplicação (Fase 8 do roteiro). */
export type CanalInterface = 'WEB' | 'APP' | 'TOTEM'

/** Perfis de acesso — enum `Role` do Back-End. */
export type Perfil = 'CLIENTE' | 'ATENDENTE' | 'GERENTE' | 'MATRIZ'

// ---------------------------------------------------------------------------
// Unidades e cardápio
// ---------------------------------------------------------------------------

export interface Unidade {
  id: number
  nome: string
  cidade: string
  uf: string // (front)
  regiao: string
  tipoCozinha: 'COMPLETA' | 'REDUZIDA'
  horarioFuncionamento: string // "06:00-22:00"
  ativa: boolean
  endereco: string // (front)
  /** Estado operacional para demonstrar o fluxo alternativo "unidade indisponível/fechada". (front) */
  statusOperacional: 'ABERTA' | 'FECHADA' | 'INDISPONIVEL'
}

export interface Categoria {
  id: string
  nome: string
  descricao: string
  icone: string // emoji ou nome de ícone
}

/** Item do cardápio de uma unidade — DTO `ItemCardapio` do Back-End + campos de apresentação. */
export interface ItemCardapio {
  produtoId: number
  nome: string
  descricao: string
  categoria: string
  preco: number
  variacaoRegional: string | null
  sazonal: boolean
  /** O Back-End filtra indisponíveis; o Front-End exibe o estado (RN02, fluxo alternativo 1). (front) */
  disponivel: boolean
  motivoIndisponibilidade?: string
  imagem: string // (front) — caminho de ilustração/emoji
  ingredientes: string[] // (front)
  alergenos: string[] // (front)
  tempoPreparoMin: number // (front)
  destaque?: boolean
}

// ---------------------------------------------------------------------------
// Clientes, usuários e LGPD
// ---------------------------------------------------------------------------

export interface Cliente {
  id: number
  nome: string
  email: string
  dataNascimento: string | null // ISO yyyy-mm-dd
  consentimentoLgpd: boolean
  dataConsentimento: string | null
  anonimizado: boolean
}

export interface Usuario {
  id: number
  email: string
  perfil: Perfil
  clienteId: number | null
  ativo: boolean
}

/** Resposta de `POST /api/auth/login` (`LoginResp`). */
export interface Sessao {
  accessToken: string
  tokenType: 'Bearer'
  email: string
  role: Perfil
  /** Dados do cliente vinculado (quando perfil CLIENTE). (front) */
  cliente: Cliente | null
}

export interface CredenciaisLogin {
  email: string
  senha: string
}

/** Dados mínimos de cadastro (LGPD — minimização). DTO `NovoCliente`. */
export interface NovoCliente {
  nome: string
  email: string
  senha: string // (front) — o Back-End atual cria o cliente sem senha; o mock cria o usuário junto
  dataNascimento?: string | null
  consentimentoLgpd: boolean
}

// ---------------------------------------------------------------------------
// Fidelidade e promoções
// ---------------------------------------------------------------------------

export type NivelFidelidade = 'INICIANTE' | 'BRONZE' | 'PRATA' | 'OURO'

/** DTO `FidelidadeResp` + campos de apresentação. */
export interface Fidelidade {
  clienteId: number
  pontos: number
  percentualDesconto: number // 0, 5, 10, 15
  frequenciaConsumo: number
  nivel: NivelFidelidade // (front)
  pontosProximoNivel: number | null // (front)
  historico: MovimentoFidelidade[] // (front)
}

export interface MovimentoFidelidade {
  id: string
  data: string
  descricao: string
  pontos: number // positivo acumula, negativo resgata
}

export type TipoPromocao = 'PERCENTUAL' | 'VALOR_FIXO'

export interface Promocao {
  id: string
  codigo: string
  titulo: string
  descricao: string
  tipo: TipoPromocao
  valor: number // percentual (ex.: 10) ou valor fixo em reais
  valorMinimoPedido: number
  unidadeIds: number[] | null // null = todas as unidades
  canais: CanalPedido[] | null // null = todos os canais
  validadeInicio: string // ISO
  validadeFim: string // ISO
  ativa: boolean
  destaque: boolean
}

// ---------------------------------------------------------------------------
// Carrinho, pedidos e status
// ---------------------------------------------------------------------------

export interface ItemCarrinho {
  produtoId: number
  nome: string
  precoUnitario: number
  quantidade: number
  imagem: string
  categoria?: string
  observacao?: string
}

/** Enum `StatusPedido` do Back-End. */
export type StatusPedido =
  | 'CRIADO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGO'
  | 'EM_PREPARO'
  | 'PRONTO'
  | 'ENTREGUE'
  | 'CANCELADO'
  | 'PAGAMENTO_RECUSADO'

export type FormaRetirada = 'BALCAO' | 'MESA' | 'RETIRADA_RAPIDA'

/** DTO `NovoPedido` + campos de apresentação. */
export interface NovoPedido {
  unidadeId: number
  clienteId: number | null
  canalPedido: CanalPedido
  itens: { produtoId: number; quantidade: number }[]
  formaRetirada: FormaRetirada // (front)
  nomeRetirada?: string // (front) — usado no TOTEM para pedido sem cadastro
  codigoPromocao?: string | null // (front)
}

export interface ItemPedido {
  produtoId: number
  nomeProduto: string
  quantidade: number
  precoUnitario: number
}

/** DTO `PedidoResp` + campos de apresentação. */
export interface Pedido {
  id: number
  unidadeId: number
  clienteId: number | null
  canalPedido: CanalPedido
  status: StatusPedido
  dataHora: string
  valorBruto: number
  desconto: number
  valorTotal: number
  itens: ItemPedido[]
  formaRetirada: FormaRetirada // (front)
  nomeRetirada: string // (front)
  codigoRetirada: string // (front) — ex.: "RZ-1042"
  descontoFidelidade: number // (front)
  descontoPromocao: number // (front)
  codigoPromocao: string | null // (front)
  pontosGanhos: number // (front)
  historicoStatus: { status: StatusPedido; em: string }[] // (front)
}

// ---------------------------------------------------------------------------
// Pagamento (integração externa MOCK)
// ---------------------------------------------------------------------------

/** Estados do gateway externo exigidos pelo roteiro (Fase 7). */
export type StatusGatewayPagamento = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'

/** Enum `StatusPagamento` do Back-End (persistência). */
export type StatusPagamentoBackend = 'SOLICITADO' | 'CONFIRMADO' | 'RECUSADO' | 'FALHA'

export type FormaPagamento = 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'VALE_REFEICAO'

/**
 * Cenário simulado pelo gateway MOCK. Permite demonstrar todos os fluxos alternativos
 * sem coletar dados financeiros reais (RN05).
 */
export type CenarioSimulacaoPagamento = 'APROVADO' | 'RECUSADO' | 'ERRO' | 'TIMEOUT'

export interface SolicitacaoPagamento {
  pedidoId: number
  valor: number
  forma: FormaPagamento
  cenario?: CenarioSimulacaoPagamento
}

export interface ResultadoPagamento {
  referenciaExterna: string
  provedor: string
  status: StatusGatewayPagamento
  mensagem: string
  codigoRetorno: string // ex.: "00" aprovado, "51" saldo insuficiente
  processadoEm: string
}

export interface Pagamento {
  id: string
  pedidoId: number
  forma: FormaPagamento
  valor: number
  tentativa: number
  referenciaExterna: string | null
  provedor: string
  status: StatusGatewayPagamento
  mensagem: string
  solicitadoEm: string
  concluidoEm: string | null
}

// ---------------------------------------------------------------------------
// Estados assíncronos genéricos (RNF10)
// ---------------------------------------------------------------------------

export type EstadoAssincrono = 'idle' | 'loading' | 'success' | 'empty' | 'error'
