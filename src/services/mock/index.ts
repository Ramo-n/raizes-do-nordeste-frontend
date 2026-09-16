import { env } from '@/config/env'
import type { Servicos } from '@/services/contracts'
import { MockPaymentGateway } from '@/services/payment/MockPaymentGateway'
import { PagamentoServiceImpl, type RepositorioPagamentos } from '@/services/payment/PagamentoServiceImpl'
import type { Pagamento } from '@/types'
import { AuthServiceMock, ClienteServiceMock, FidelidadeServiceMock } from './authClienteMock'
import { obterDb, salvarDb } from './mockDb'
import { PedidoServiceMock } from './pedidoMock'
import { PromocaoServiceMock } from './promocaoMock'
import { CardapioServiceMock, UnidadeServiceMock } from './unidadeCardapioMock'

const repositorioPagamentos: RepositorioPagamentos = {
  salvar(p: Pagamento) {
    const db = obterDb()
    const idx = db.pagamentos.findIndex((x) => x.id === p.id)
    if (idx >= 0) db.pagamentos[idx] = structuredClone(p)
    else db.pagamentos.push(structuredClone(p))
    salvarDb()
  },
  listarPorPedido(pedidoId: number) {
    return structuredClone(obterDb().pagamentos.filter((p) => p.pedidoId === pedidoId))
  },
}

export function criarServicosMock(opcoes?: { latenciaPagamentoMs?: number; timeoutPagamentoMs?: number }): Servicos {
  const pedidos = new PedidoServiceMock()
  const gateway = new MockPaymentGateway(opcoes?.latenciaPagamentoMs ?? (env.isTest ? 10 : 1800))
  return {
    unidades: new UnidadeServiceMock(),
    cardapio: new CardapioServiceMock(),
    auth: new AuthServiceMock(),
    clientes: new ClienteServiceMock(),
    fidelidade: new FidelidadeServiceMock(),
    promocoes: new PromocaoServiceMock(),
    pedidos,
    pagamentos: new PagamentoServiceImpl(gateway, pedidos, repositorioPagamentos, opcoes?.timeoutPagamentoMs ?? env.paymentTimeoutMs),
  }
}

export { reiniciarDb, obterSimulacao, definirSimulacao } from './mockDb'
