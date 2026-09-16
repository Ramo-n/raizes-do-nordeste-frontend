import { env, STORAGE_KEYS } from '@/config/env'
import type {
  AuthService,
  CardapioService,
  ClienteService,
  FidelidadeService,
  PedidoService,
  PromocaoService,
  ResultadoValidacaoPromocao,
  Servicos,
  UnidadeService,
} from '@/services/contracts'
import { ErroNegocio } from '@/services/errors'
import { http } from '@/services/http/httpClient'
import { MockPaymentGateway } from '@/services/payment/MockPaymentGateway'
import { PagamentoServiceImpl, type RepositorioPagamentos } from '@/services/payment/PagamentoServiceImpl'
import { categoriasMock, produtosMock, promocoesMock } from '@/data/mock'
import { validarPromocao } from '@/services/mock/promocaoMock'
import { calcularNivel } from '@/services/mock/authClienteMock'
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
  Perfil,
  Promocao,
  Sessao,
  StatusGatewayPagamento,
  StatusPagamentoBackend,
  Unidade,
} from '@/types'
import { storage } from '@/utils/storage'

/**
 * Implementação API — chama o Back-End Spring Boot (`raizes-do-nordeste-backend`).
 * Ativada com `VITE_DATA_SOURCE=api`. Onde o Back-End ainda não expõe um dado
 * (categorias, promoções, campos de apresentação), o adaptador complementa com
 * o Mock Data centralizado — decisão documentada em docs/11-entrega-tecnica.md.
 */

// -- DTOs do Back-End -------------------------------------------------------

interface UnidadeApi {
  id: number
  nome: string
  cidade: string
  regiao: string
  tipoCozinha: 'COMPLETA' | 'REDUZIDA'
  horarioFuncionamento: string
  ativa: boolean
}

interface ItemCardapioApi {
  produtoId: number
  nome: string
  descricao: string
  categoria: string
  preco: number
  variacaoRegional: string | null
  sazonal: boolean
}

interface LoginRespApi {
  accessToken: string
  tokenType: string
  email: string
  role: Perfil
}

interface ClienteApi {
  id: number
  nome: string
  email: string
  dataNascimento: string | null
  consentimentoLgpd: boolean
  dataConsentimento: string | null
  anonimizado: boolean
}

interface PedidoRespApi {
  id: number
  unidadeId: number
  clienteId: number | null
  canalPedido: CanalPedido
  status: Pedido['status']
  dataHora: string
  valorBruto: number
  desconto: number
  valorTotal: number
  itens: { produtoId: number; nomeProduto: string; quantidade: number; precoUnitario: number }[]
}

interface FidelidadeRespApi {
  clienteId: number
  pontos: number
  percentualDesconto: number
  frequenciaConsumo: number
}

// -- Adaptadores ------------------------------------------------------------

function adaptarUnidade(u: UnidadeApi): Unidade {
  return {
    ...u,
    uf: '',
    endereco: '',
    statusOperacional: u.ativa ? 'ABERTA' : 'INDISPONIVEL',
  }
}

function adaptarItem(i: ItemCardapioApi): ItemCardapio {
  const base = produtosMock.find((p) => p.id === i.produtoId)
  return {
    ...i,
    disponivel: true, // o Back-End já filtra indisponíveis
    imagem: base?.imagem ?? '🍽️',
    ingredientes: base?.ingredientes ?? [],
    alergenos: base?.alergenos ?? [],
    tempoPreparoMin: base?.tempoPreparoMin ?? 10,
    destaque: base?.destaque,
  }
}

/** Metadados do pedido que o Back-End não persiste ficam no localStorage, indexados por id. */
const metaPedidos = {
  chave: 'rzn.api.meta-pedidos',
  obter(id: number) {
    return storage.get<Record<number, Partial<Pedido>>>(this.chave, {})[id] ?? {}
  },
  salvar(id: number, meta: Partial<Pedido>) {
    const todos = storage.get<Record<number, Partial<Pedido>>>(this.chave, {})
    todos[id] = { ...todos[id], ...meta }
    storage.set(this.chave, todos)
  },
}

function adaptarPedido(p: PedidoRespApi): Pedido {
  const meta = metaPedidos.obter(p.id)
  return {
    ...p,
    formaRetirada: meta.formaRetirada ?? 'BALCAO',
    nomeRetirada: meta.nomeRetirada ?? 'Cliente',
    codigoRetirada: `RZ-${p.id}`,
    descontoFidelidade: p.desconto,
    descontoPromocao: 0,
    codigoPromocao: meta.codigoPromocao ?? null,
    pontosGanhos: p.status === 'PAGO' || p.status === 'EM_PREPARO' || p.status === 'PRONTO' || p.status === 'ENTREGUE' ? Math.floor(p.valorTotal) : 0,
    historicoStatus: meta.historicoStatus ?? [{ status: p.status, em: p.dataHora }],
  }
}

export function paraStatusBackend(status: StatusGatewayPagamento): StatusPagamentoBackend {
  switch (status) {
    case 'APPROVED':
      return 'CONFIRMADO'
    case 'DECLINED':
      return 'RECUSADO'
    case 'ERROR':
      return 'FALHA'
    case 'PENDING':
      return 'SOLICITADO'
  }
}

// -- Serviços ---------------------------------------------------------------

class UnidadeServiceApi implements UnidadeService {
  async listar(): Promise<Unidade[]> {
    return (await http<UnidadeApi[]>('/unidades')).map(adaptarUnidade)
  }
  async obter(id: number): Promise<Unidade> {
    return adaptarUnidade(await http<UnidadeApi>(`/unidades/${id}`))
  }
}

class CardapioServiceApi implements CardapioService {
  async listarCategorias(): Promise<Categoria[]> {
    return structuredClone(categoriasMock)
  }
  async cardapioDaUnidade(unidadeId: number): Promise<ItemCardapio[]> {
    return (await http<ItemCardapioApi[]>(`/unidades/${unidadeId}/cardapio`)).map(adaptarItem)
  }
  async obterItem(unidadeId: number, produtoId: number): Promise<ItemCardapio> {
    const item = (await this.cardapioDaUnidade(unidadeId)).find((i) => i.produtoId === produtoId)
    if (!item) throw new ErroNegocio('Produto não encontrado no cardápio desta unidade.')
    return item
  }
}

class AuthServiceApi implements AuthService {
  async login(credenciais: CredenciaisLogin): Promise<Sessao> {
    const r = await http<LoginRespApi>('/auth/login', { metodo: 'POST', corpo: credenciais, autenticar: false })
    const sessao: Sessao = { accessToken: r.accessToken, tokenType: 'Bearer', email: r.email, role: r.role, cliente: null }
    storage.set(STORAGE_KEYS.sessao, sessao)
    return sessao
  }
  async cadastrar(dados: NovoCliente): Promise<Sessao> {
    // O Back-End cria o cliente (POST /api/clientes) mas não cria usuário de login;
    // a sessão resultante é local até que o endpoint de cadastro de usuário exista.
    const c = await http<ClienteApi>('/clientes', {
      metodo: 'POST',
      corpo: { nome: dados.nome, email: dados.email, dataNascimento: dados.dataNascimento ?? null, consentimentoLgpd: dados.consentimentoLgpd },
      autenticar: false,
    })
    const sessao: Sessao = { accessToken: '', tokenType: 'Bearer', email: c.email, role: 'CLIENTE', cliente: c }
    storage.set(STORAGE_KEYS.sessao, sessao)
    return sessao
  }
  sessaoAtual(): Sessao | null {
    return storage.get<Sessao | null>(STORAGE_KEYS.sessao, null)
  }
  sair(): void {
    storage.remove(STORAGE_KEYS.sessao)
  }
}

class ClienteServiceApi implements ClienteService {
  async obter(id: number): Promise<Cliente> {
    return http<ClienteApi>(`/clientes/${id}`)
  }
  async registrarConsentimento(clienteId: number): Promise<Cliente> {
    return http<ClienteApi>(`/clientes/${clienteId}/consentimento`, { metodo: 'POST' })
  }
  async solicitarAnonimizacao(clienteId: number): Promise<void> {
    await http<unknown>(`/clientes/${clienteId}/anonimizacao`, { metodo: 'POST' })
    storage.remove(STORAGE_KEYS.sessao)
  }
}

class FidelidadeServiceApi implements FidelidadeService {
  async consultar(clienteId: number): Promise<Fidelidade> {
    const r = await http<FidelidadeRespApi>(`/clientes/${clienteId}/fidelidade`)
    const nivel = calcularNivel(r.pontos)
    return { ...r, percentualDesconto: Math.round(r.percentualDesconto * 100), nivel: nivel.nivel, pontosProximoNivel: nivel.pontosProximoNivel, historico: [] }
  }
}

class PromocaoServiceApi implements PromocaoService {
  async listar(unidadeId?: number): Promise<Promocao[]> {
    return structuredClone(promocoesMock.filter((p) => unidadeId == null || !p.unidadeIds || p.unidadeIds.includes(unidadeId)))
  }
  async validar(codigo: string, ctx: { unidadeId: number; canal: CanalPedido; subtotal: number }): Promise<ResultadoValidacaoPromocao> {
    return validarPromocao(promocoesMock, codigo, ctx)
  }
}

class PedidoServiceApi implements PedidoService {
  async criar(novo: NovoPedido): Promise<Pedido> {
    const r = await http<PedidoRespApi>('/pedidos', {
      metodo: 'POST',
      corpo: { unidadeId: novo.unidadeId, clienteId: novo.clienteId, canalPedido: novo.canalPedido, itens: novo.itens },
    })
    metaPedidos.salvar(r.id, {
      formaRetirada: novo.formaRetirada,
      nomeRetirada: novo.nomeRetirada,
      codigoPromocao: novo.codigoPromocao ?? null,
      historicoStatus: [{ status: r.status, em: r.dataHora }],
    })
    return adaptarPedido(r)
  }
  async obter(id: number): Promise<Pedido> {
    const p = adaptarPedido(await http<PedidoRespApi>(`/pedidos/${id}`))
    const ultimo = p.historicoStatus[p.historicoStatus.length - 1]
    if (ultimo?.status !== p.status) {
      p.historicoStatus.push({ status: p.status, em: new Date().toISOString() })
      metaPedidos.salvar(id, { historicoStatus: p.historicoStatus })
    }
    return p
  }
  async listar(filtro?: { clienteId?: number; unidadeId?: number }): Promise<Pedido[]> {
    const q = filtro?.unidadeId != null ? `?unidadeId=${filtro.unidadeId}` : ''
    return (await http<PedidoRespApi[]>(`/pedidos${q}`)).map(adaptarPedido).filter((p) => filtro?.clienteId == null || p.clienteId === filtro.clienteId)
  }
  async avancarStatus(id: number): Promise<Pedido> {
    return adaptarPedido(await http<PedidoRespApi>(`/pedidos/${id}/avancar`, { metodo: 'POST' }))
  }
  async registrarResultadoPagamento(pedidoId: number, referenciaExterna: string, status: StatusGatewayPagamento): Promise<Pedido> {
    if (status === 'ERROR' || status === 'PENDING') return this.obter(pedidoId) // Back-End só aceita CONFIRMADO/RECUSADO
    return adaptarPedido(
      await http<PedidoRespApi>(`/pagamentos/${pedidoId}/resultado`, {
        metodo: 'POST',
        corpo: { referenciaExterna, status: paraStatusBackend(status) },
      }),
    )
  }
}

const repositorioPagamentosLocal: RepositorioPagamentos = {
  chave: 'rzn.api.pagamentos',
  salvar(p: Pagamento) {
    const todos = storage.get<Pagamento[]>(this.chave, [])
    const idx = todos.findIndex((x) => x.id === p.id)
    if (idx >= 0) todos[idx] = p
    else todos.push(p)
    storage.set(this.chave, todos)
  },
  listarPorPedido(pedidoId: number) {
    return storage.get<Pagamento[]>(this.chave, []).filter((p) => p.pedidoId === pedidoId)
  },
} as RepositorioPagamentos & { chave: string }

export function criarServicosApi(): Servicos {
  const pedidos = new PedidoServiceApi()
  return {
    unidades: new UnidadeServiceApi(),
    cardapio: new CardapioServiceApi(),
    auth: new AuthServiceApi(),
    clientes: new ClienteServiceApi(),
    fidelidade: new FidelidadeServiceApi(),
    promocoes: new PromocaoServiceApi(),
    pedidos,
    // O gateway continua MOCK mesmo em modo API: o Back-End também usa `PagamentoGatewaySimulado`.
    pagamentos: new PagamentoServiceImpl(new MockPaymentGateway(), pedidos, repositorioPagamentosLocal, env.paymentTimeoutMs),
  }
}
