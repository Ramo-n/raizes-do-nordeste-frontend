import type { PedidoService } from '@/services/contracts'
import { ErroNaoEncontrado, ErroNegocio, ErroValidacao } from '@/services/errors'
import { montarCardapio, promocoesMock, unidadesMock } from '@/data/mock'
import type { ItemPedido, NovoPedido, Pedido, StatusGatewayPagamento, StatusPedido } from '@/types'
import { agoraIso } from '@/utils/async'
import { arredondar } from '@/utils/format'
import { simularRede } from './base'
import { obterDb, salvarDb } from './mockDb'
import { calcularNivel } from './authClienteMock'
import { validarPromocao } from './promocaoMock'

/**
 * Tempos (ms) da simulação da cozinha: após o pagamento o pedido avança sozinho
 * PAGO → EM_PREPARO → PRONTO, permitindo demonstrar o acompanhamento (RF10)
 * sem depender do painel operacional. ENTREGUE exige ação explícita.
 */
export const TEMPOS_COZINHA_MS = { emPreparo: 8_000, pronto: 25_000 }

function ultimoStatusEm(pedido: Pedido, status: StatusPedido): number | null {
  const h = [...pedido.historicoStatus].reverse().find((x) => x.status === status)
  return h ? new Date(h.em).getTime() : null
}

function mudarStatus(pedido: Pedido, status: StatusPedido, em: string = agoraIso()): void {
  pedido.status = status
  pedido.historicoStatus.push({ status, em })
}

function simularCozinha(pedido: Pedido, agora = Date.now()): void {
  if (pedido.status === 'PAGO') {
    const pagoEm = ultimoStatusEm(pedido, 'PAGO')
    if (pagoEm != null && agora - pagoEm >= TEMPOS_COZINHA_MS.emPreparo) {
      mudarStatus(pedido, 'EM_PREPARO', new Date(pagoEm + TEMPOS_COZINHA_MS.emPreparo).toISOString())
    }
  }
  if (pedido.status === 'EM_PREPARO') {
    const pagoEm = ultimoStatusEm(pedido, 'PAGO')
    if (pagoEm != null && agora - pagoEm >= TEMPOS_COZINHA_MS.pronto) {
      mudarStatus(pedido, 'PRONTO', new Date(pagoEm + TEMPOS_COZINHA_MS.pronto).toISOString())
    }
  }
}

export class PedidoServiceMock implements PedidoService {
  async criar(novo: NovoPedido): Promise<Pedido> {
    await simularRede()
    const db = obterDb()

    // RN01 — todo pedido pertence a uma unidade ativa e aberta
    const unidade = unidadesMock.find((u) => u.id === novo.unidadeId)
    if (!unidade) throw new ErroNaoEncontrado(`Unidade não encontrada: ${novo.unidadeId}`)
    if (!unidade.ativa || unidade.statusOperacional !== 'ABERTA') {
      throw new ErroNegocio('A unidade selecionada não está recebendo pedidos no momento.')
    }
    if (!novo.itens.length) throw new ErroValidacao('O carrinho está vazio. Adicione produtos antes de finalizar.')
    if (novo.clienteId == null && !novo.nomeRetirada?.trim()) {
      throw new ErroValidacao('Informe um nome para a retirada do pedido.', { nomeRetirada: 'Informe um nome para chamarmos você no balcão.' })
    }

    // RN02 — produtos indisponíveis não podem ser adicionados
    const cardapio = montarCardapio(novo.unidadeId)
    const itens: ItemPedido[] = []
    let bruto = 0
    for (const i of novo.itens) {
      const item = cardapio.find((c) => c.produtoId === i.produtoId)
      if (!item) throw new ErroNegocio(`Produto ${i.produtoId} não pertence ao cardápio da unidade.`)
      if (!item.disponivel) throw new ErroNegocio(`Produto indisponível nesta unidade: ${item.nome}.`)
      if (i.quantidade < 1) throw new ErroValidacao('Quantidade inválida.')
      itens.push({ produtoId: item.produtoId, nomeProduto: item.nome, quantidade: i.quantidade, precoUnitario: item.preco })
      bruto += item.preco * i.quantidade
    }
    bruto = arredondar(bruto)

    // RN03 — total considera quantidade, preço e benefícios
    const cliente = novo.clienteId != null ? db.clientes.find((c) => c.id === novo.clienteId) : undefined
    if (novo.clienteId != null && !cliente) throw new ErroNaoEncontrado(`Cliente não encontrado: ${novo.clienteId}`)

    let descontoFidelidade = 0
    if (cliente?.consentimentoLgpd) {
      const conta = db.fidelidade.find((f) => f.clienteId === cliente.id)
      if (conta) descontoFidelidade = arredondar((bruto * calcularNivel(conta.pontos).percentual) / 100)
    }

    let descontoPromocao = 0
    let codigoPromocao: string | null = null
    if (novo.codigoPromocao) {
      const r = validarPromocao(promocoesMock, novo.codigoPromocao, { unidadeId: novo.unidadeId, canal: novo.canalPedido, subtotal: bruto })
      if (!r.valida) throw new ErroNegocio(r.motivo ?? 'Promoção inválida.')
      descontoPromocao = r.desconto
      codigoPromocao = r.promocao?.codigo ?? null
    }

    const desconto = arredondar(Math.min(descontoFidelidade + descontoPromocao, bruto))
    const id = db.proximoPedidoId++
    const pedido: Pedido = {
      id,
      unidadeId: novo.unidadeId,
      clienteId: novo.clienteId,
      canalPedido: novo.canalPedido,
      status: 'AGUARDANDO_PAGAMENTO',
      dataHora: agoraIso(),
      valorBruto: bruto,
      desconto,
      valorTotal: arredondar(bruto - desconto),
      itens,
      formaRetirada: novo.formaRetirada,
      nomeRetirada: (novo.nomeRetirada?.trim() || cliente?.nome.split(' ')[0]) ?? 'Cliente',
      codigoRetirada: `RZ-${id}`,
      descontoFidelidade,
      descontoPromocao,
      codigoPromocao,
      pontosGanhos: 0,
      historicoStatus: [{ status: 'AGUARDANDO_PAGAMENTO', em: agoraIso() }],
    }
    db.pedidos.push(pedido)
    salvarDb()
    return structuredClone(pedido)
  }

  async obter(id: number): Promise<Pedido> {
    await simularRede()
    const pedido = obterDb().pedidos.find((p) => p.id === id)
    if (!pedido) throw new ErroNaoEncontrado(`Pedido não encontrado: ${id}`)
    simularCozinha(pedido)
    salvarDb()
    return structuredClone(pedido)
  }

  async listar(filtro?: { clienteId?: number; unidadeId?: number }): Promise<Pedido[]> {
    await simularRede()
    const db = obterDb()
    db.pedidos.forEach((p) => simularCozinha(p))
    salvarDb()
    return structuredClone(
      db.pedidos
        .filter((p) => (filtro?.clienteId == null || p.clienteId === filtro.clienteId) && (filtro?.unidadeId == null || p.unidadeId === filtro.unidadeId))
        .sort((a, b) => b.dataHora.localeCompare(a.dataHora)),
    )
  }

  async avancarStatus(id: number): Promise<Pedido> {
    await simularRede()
    const pedido = obterDb().pedidos.find((p) => p.id === id)
    if (!pedido) throw new ErroNaoEncontrado(`Pedido não encontrado: ${id}`)
    const proximo: Partial<Record<StatusPedido, StatusPedido>> = { PAGO: 'EM_PREPARO', EM_PREPARO: 'PRONTO', PRONTO: 'ENTREGUE' }
    const novo = proximo[pedido.status]
    if (!novo) throw new ErroNegocio(`Não é possível avançar o pedido no status ${pedido.status}.`)
    mudarStatus(pedido, novo)
    salvarDb()
    return structuredClone(pedido)
  }

  /** RN04 — o pedido só é confirmado como pago após retorno positivo do serviço de pagamento. */
  async registrarResultadoPagamento(pedidoId: number, _referenciaExterna: string, status: StatusGatewayPagamento): Promise<Pedido> {
    await simularRede(0)
    const db = obterDb()
    const pedido = db.pedidos.find((p) => p.id === pedidoId)
    if (!pedido) throw new ErroNaoEncontrado(`Pedido não encontrado: ${pedidoId}`)
    if (pedido.status !== 'AGUARDANDO_PAGAMENTO' && pedido.status !== 'PAGAMENTO_RECUSADO') {
      return structuredClone(pedido) // idempotente: resultado já processado
    }

    if (status === 'APPROVED') {
      mudarStatus(pedido, 'PAGO')
      const cliente = pedido.clienteId != null ? db.clientes.find((c) => c.id === pedido.clienteId) : undefined
      if (cliente?.consentimentoLgpd) {
        const conta = db.fidelidade.find((f) => f.clienteId === cliente.id)
        if (conta) {
          const pontos = Math.floor(pedido.valorTotal)
          conta.pontos += pontos
          conta.frequenciaConsumo += 1
          conta.historico.unshift({ id: `mov-${pedido.id}`, data: agoraIso(), descricao: `Pedido #${pedido.id}`, pontos })
          pedido.pontosGanhos = pontos
        }
      }
    } else if (status === 'DECLINED') {
      mudarStatus(pedido, 'PAGAMENTO_RECUSADO')
    } else if (status === 'ERROR') {
      if (pedido.status !== 'AGUARDANDO_PAGAMENTO') mudarStatus(pedido, 'AGUARDANDO_PAGAMENTO')
    }
    salvarDb()
    return structuredClone(pedido)
  }
}
