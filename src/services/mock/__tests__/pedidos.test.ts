import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Servicos } from '@/services/contracts'
import { ErroNegocio, ErroRede, ErroValidacao } from '@/services/errors'
import { definirSimulacao } from '@/services/mock'
import { TEMPOS_COZINHA_MS } from '@/services/mock/pedidoMock'
import { servicosLimpos } from '@/test/helpers'
import type { NovoPedido } from '@/types'

const pedidoBase: NovoPedido = {
  unidadeId: 1,
  clienteId: 1, // Maria — nível BRONZE (5%) com consentimento LGPD
  canalPedido: 'WEB',
  itens: [{ produtoId: 1, quantidade: 2 }], // 2 × R$ 12,00
  formaRetirada: 'BALCAO',
}

describe('UC03/UC04 — Unidades e cardápio (RF03, RF05)', () => {
  let s: Servicos
  beforeEach(() => {
    s = servicosLimpos()
  })

  it('CT06 — seleção de unidade: lista unidades com status operacional e impede pedido em unidade fechada', async () => {
    const unidades = await s.unidades.listar()
    expect(unidades.length).toBeGreaterThanOrEqual(3)
    const fechada = unidades.find((u) => u.statusOperacional === 'FECHADA')
    expect(fechada).toBeDefined()
    const erro = await s.pedidos.criar({ ...pedidoBase, unidadeId: fechada!.id }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroNegocio)
    expect(erro.message).toMatch(/não está recebendo pedidos/i)
  })

  it('CT05 — cardápio por unidade: unidades diferentes possuem preços/variações regionais próprias', async () => {
    const recife = await s.cardapio.cardapioDaUnidade(1)
    const salvador = await s.cardapio.cardapioDaUnidade(2)
    expect(recife.length).toBeGreaterThan(0)
    const tapiocaRecife = recife.find((i) => i.produtoId === 1)!
    const tapiocaSalvador = salvador.find((i) => i.produtoId === 1)!
    expect(tapiocaRecife.preco).toBe(12)
    expect(tapiocaSalvador.preco).toBe(14)
    expect(tapiocaSalvador.variacaoRegional).toBeTruthy()
    const categorias = await s.cardapio.listarCategorias()
    expect(categorias.map((c) => c.nome)).toContain('Tapiocas')
  })

  it('CT16 — produto indisponível é exibido como indisponível e não pode entrar no pedido (RN02)', async () => {
    const cardapio = await s.cardapio.cardapioDaUnidade(1)
    const indisponivel = cardapio.find((i) => i.produtoId === 8)
    expect(indisponivel).toBeDefined()
    expect(indisponivel!.disponivel).toBe(false)
    expect(indisponivel!.motivoIndisponibilidade).toBe('Esgotado hoje')
    const sazonal = cardapio.find((i) => i.sazonal && !i.disponivel)
    expect(sazonal?.motivoIndisponibilidade).toMatch(/sazonal/i)
    const erro = await s.pedidos.criar({ ...pedidoBase, itens: [{ produtoId: indisponivel!.produtoId, quantidade: 1 }] }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroNegocio)
    expect(erro.message).toMatch(/indisponível/i)
  })

  it('CT17 — falha de comunicação: serviços retornam erro de rede com mensagem amigável', async () => {
    definirSimulacao({ falhaComunicacao: true })
    const erro = await s.cardapio.cardapioDaUnidade(1).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroRede)
    expect(erro.message).toMatch(/conexão|comunicação/i)
    definirSimulacao({ falhaComunicacao: false })
    await expect(s.cardapio.cardapioDaUnidade(1)).resolves.toBeInstanceOf(Array)
  })
})

describe('UC05/UC07/UC09 — Pedido, benefícios e acompanhamento (RF09–RF13)', () => {
  let s: Servicos
  beforeEach(() => {
    s = servicosLimpos()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('CT08 — carrinho vazio: não é possível criar pedido sem itens', async () => {
    const erro = await s.pedidos.criar({ ...pedidoBase, itens: [] }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroValidacao)
    expect(erro.message).toMatch(/carrinho está vazio/i)
  })

  it('CT09 — finalização do pedido: total considera quantidade, preço e desconto de fidelidade (RN01, RN03)', async () => {
    const pedido = await s.pedidos.criar(pedidoBase)
    expect(pedido.unidadeId).toBe(1)
    expect(pedido.status).toBe('AGUARDANDO_PAGAMENTO')
    expect(pedido.valorBruto).toBe(24)
    expect(pedido.descontoFidelidade).toBe(1.2) // 5% BRONZE
    expect(pedido.valorTotal).toBe(22.8)
    expect(pedido.codigoRetirada).toBe(`RZ-${pedido.id}`)
  })

  it('CT09b — promoção válida aplica desconto; inválida/indisponível é recusada com motivo claro', async () => {
    const comPromo = await s.pedidos.criar({ ...pedidoBase, codigoPromocao: 'BEMVINDO10' })
    expect(comPromo.descontoPromocao).toBeGreaterThan(0)
    expect(comPromo.codigoPromocao).toBe('BEMVINDO10')

    const invalida = await s.pedidos.criar({ ...pedidoBase, codigoPromocao: 'NAOEXISTE' }).catch((e) => e)
    expect(invalida).toBeInstanceOf(ErroNegocio)
    expect(invalida.message).toMatch(/não encontrado/i)

    const canalErrado = await s.pedidos.criar({ ...pedidoBase, codigoPromocao: 'TOTEM15' }).catch((e) => e)
    expect(canalErrado).toBeInstanceOf(ErroNegocio)
    expect(canalErrado.message).toMatch(/exclusiva para o canal/i)
  })

  it('CT11b — pedido sem dados obrigatórios (TOTEM sem nome) é barrado', async () => {
    const erro = await s.pedidos.criar({ ...pedidoBase, clienteId: null, canalPedido: 'TOTEM', nomeRetirada: '' }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroValidacao)
    expect(erro.detalhes?.nomeRetirada).toBeTruthy()
  })

  it('CT13 — acompanhamento: após pagamento o pedido evolui PAGO → EM_PREPARO → PRONTO → ENTREGUE', async () => {
    const pedido = await s.pedidos.criar(pedidoBase)
    const pago = await s.pedidos.registrarResultadoPagamento(pedido.id, 'EXT-1', 'APPROVED')
    expect(pago.status).toBe('PAGO')
    expect(pago.pontosGanhos).toBe(Math.floor(pago.valorTotal)) // 1 ponto por real

    const inicio = Date.now()
    vi.useFakeTimers()
    vi.setSystemTime(inicio + TEMPOS_COZINHA_MS.emPreparo + 100)
    const p1 = s.pedidos.obter(pedido.id)
    await vi.runAllTimersAsync()
    expect((await p1).status).toBe('EM_PREPARO')

    vi.setSystemTime(inicio + TEMPOS_COZINHA_MS.pronto + 100)
    const p2 = s.pedidos.obter(pedido.id)
    await vi.runAllTimersAsync()
    expect((await p2).status).toBe('PRONTO')

    const p3 = s.pedidos.avancarStatus(pedido.id)
    await vi.runAllTimersAsync()
    const entregue = await p3
    expect(entregue.status).toBe('ENTREGUE')
    expect(entregue.historicoStatus.map((h) => h.status)).toEqual(['AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE'])
  })

  it('CT12b — fidelidade: pontos acumulados após pagamento aparecem na consulta', async () => {
    const antes = await s.fidelidade.consultar(1)
    const pedido = await s.pedidos.criar(pedidoBase)
    await s.pedidos.registrarResultadoPagamento(pedido.id, 'EXT-2', 'APPROVED')
    const depois = await s.fidelidade.consultar(1)
    expect(depois.pontos).toBe(antes.pontos + Math.floor(pedido.valorTotal))
    expect(depois.historico[0].descricao).toContain(`#${pedido.id}`)
  })
})
