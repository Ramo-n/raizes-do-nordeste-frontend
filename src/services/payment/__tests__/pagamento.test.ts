import { beforeEach, describe, expect, it } from 'vitest'
import type { Servicos } from '@/services/contracts'
import { MockPaymentGateway } from '@/services/payment/MockPaymentGateway'
import { servicosLimpos } from '@/test/helpers'
import type { NovoPedido, Pedido, StatusGatewayPagamento } from '@/types'

const novoPedido: NovoPedido = { unidadeId: 1, clienteId: 1, canalPedido: 'APP', itens: [{ produtoId: 2, quantidade: 1 }], formaRetirada: 'RETIRADA_RAPIDA' }

describe('UC08 — Realizar Pagamento via gateway externo MOCK (RF14–RF16, RN04, RN05)', () => {
  let s: Servicos
  let pedido: Pedido
  beforeEach(async () => {
    s = servicosLimpos({ timeoutPagamentoMs: 60 })
    pedido = await s.pedidos.criar(novoPedido)
  })

  it('CT10 — pagamento aprovado: transições REQUESTED → PENDING → APPROVED e pedido confirmado como PAGO', async () => {
    const estados: (StatusGatewayPagamento | 'REQUESTED')[] = []
    const pg = await s.pagamentos.pagar({ pedidoId: pedido.id, valor: pedido.valorTotal, forma: 'PIX', cenario: 'APROVADO' }, (e) => estados.push(e))
    expect(estados).toEqual(['REQUESTED', 'PENDING', 'APPROVED'])
    expect(pg.status).toBe('APPROVED')
    expect(pg.provedor).toBe('provedor-simulado')
    expect(pg.referenciaExterna).toMatch(/^EXT-/)
    expect(pg.tentativa).toBe(1)
    expect((await s.pedidos.obter(pedido.id)).status).toBe('PAGO')
  })

  it('CT11 — pagamento recusado: estado DECLINED, mensagem clara e pedido NÃO é confirmado (RN04)', async () => {
    const pg = await s.pagamentos.pagar({ pedidoId: pedido.id, valor: pedido.valorTotal, forma: 'CARTAO_CREDITO', cenario: 'RECUSADO' })
    expect(pg.status).toBe('DECLINED')
    expect(pg.mensagem).toMatch(/recusado/i)
    expect((await s.pedidos.obter(pedido.id)).status).toBe('PAGAMENTO_RECUSADO')
  })

  it('CT12 — nova tentativa após recusa: segunda tentativa aprovada confirma o pedido e o histórico registra ambas', async () => {
    await s.pagamentos.pagar({ pedidoId: pedido.id, valor: pedido.valorTotal, forma: 'CARTAO_DEBITO', cenario: 'RECUSADO' })
    const segunda = await s.pagamentos.pagar({ pedidoId: pedido.id, valor: pedido.valorTotal, forma: 'PIX', cenario: 'APROVADO' })
    expect(segunda.tentativa).toBe(2)
    expect(segunda.status).toBe('APPROVED')
    expect((await s.pedidos.obter(pedido.id)).status).toBe('PAGO')
    const historico = await s.pagamentos.historico(pedido.id)
    expect(historico.map((h) => h.status)).toEqual(['DECLINED', 'APPROVED'])
  })

  it('CT11c — erro no serviço de pagamento: estado ERROR, nenhuma cobrança e pedido segue aguardando pagamento', async () => {
    const pg = await s.pagamentos.pagar({ pedidoId: pedido.id, valor: pedido.valorTotal, forma: 'PIX', cenario: 'ERRO' })
    expect(pg.status).toBe('ERROR')
    expect(pg.mensagem).toMatch(/nenhuma cobrança/i)
    expect((await s.pedidos.obter(pedido.id)).status).toBe('AGUARDANDO_PAGAMENTO')
  })

  it('CT11d — timeout no pagamento: serviço aborta a chamada e informa esgotamento do tempo', async () => {
    const pg = await s.pagamentos.pagar({ pedidoId: pedido.id, valor: pedido.valorTotal, forma: 'PIX', cenario: 'TIMEOUT' })
    expect(pg.status).toBe('ERROR')
    expect(pg.mensagem).toMatch(/tempo de resposta/i)
    expect((await s.pedidos.obter(pedido.id)).status).toBe('AGUARDANDO_PAGAMENTO')
  })

  it('CT10b — pagamento já aprovado é idempotente: novo retorno não altera o pedido', async () => {
    await s.pagamentos.pagar({ pedidoId: pedido.id, valor: pedido.valorTotal, forma: 'PIX', cenario: 'APROVADO' })
    const depois = await s.pedidos.registrarResultadoPagamento(pedido.id, 'EXT-x', 'DECLINED')
    expect(depois.status).toBe('PAGO')
  })

  it('gateway MOCK sorteia cenários com aprovação majoritária quando a interface não informa cenário', async () => {
    const gw = new MockPaymentGateway(0, () => 0.1)
    const r = await gw.solicitarPagamento({ pedidoId: 1, valor: 10, forma: 'PIX' })
    expect(r.status).toBe('APPROVED')
    const recusa = await new MockPaymentGateway(0, () => 0.9).solicitarPagamento({ pedidoId: 1, valor: 10, forma: 'PIX' })
    expect(recusa.status).toBe('DECLINED')
  })
})
