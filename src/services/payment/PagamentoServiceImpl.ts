import type { PagamentoService, PaymentGateway, PedidoService } from '@/services/contracts'
import type { Pagamento, SolicitacaoPagamento, StatusGatewayPagamento } from '@/types'
import { comTimeout, agoraIso, gerarId } from '@/utils/async'
import { paraAppError } from '@/services/errors'

export interface RepositorioPagamentos {
  salvar(p: Pagamento): void
  listarPorPedido(pedidoId: number): Pagamento[]
}

/**
 * Serviço de pagamento do Front-End. Faz a ponte:
 *
 *   Interface → PagamentoService → PaymentGateway (MOCK/real) → retorno → PedidoService.registrarResultadoPagamento
 *
 * Responsabilidades:
 *  - controlar tentativas (cada chamada gera uma nova tentativa para o mesmo pedido);
 *  - aplicar timeout (fluxo alternativo "timeout no pagamento");
 *  - traduzir falhas de comunicação em estado ERROR;
 *  - notificar a interface das transições (REQUESTED → PENDING → APPROVED/DECLINED/ERROR).
 */
export class PagamentoServiceImpl implements PagamentoService {
  constructor(
    private readonly gateway: PaymentGateway,
    private readonly pedidos: PedidoService,
    private readonly repositorio: RepositorioPagamentos,
    private readonly timeoutMs: number,
  ) {}

  async pagar(
    solicitacao: SolicitacaoPagamento,
    onEstado?: (estado: StatusGatewayPagamento | 'REQUESTED') => void,
  ): Promise<Pagamento> {
    const tentativa = this.repositorio.listarPorPedido(solicitacao.pedidoId).length + 1
    const pagamento: Pagamento = {
      id: gerarId('pag'),
      pedidoId: solicitacao.pedidoId,
      forma: solicitacao.forma,
      valor: solicitacao.valor,
      tentativa,
      referenciaExterna: null,
      provedor: this.gateway.nomeProvedor(),
      status: 'PENDING',
      mensagem: 'Pagamento solicitado',
      solicitadoEm: agoraIso(),
      concluidoEm: null,
    }
    this.repositorio.salvar(pagamento)
    onEstado?.('REQUESTED')
    onEstado?.('PENDING')

    const controller = new AbortController()
    try {
      const resultado = await comTimeout(this.gateway.solicitarPagamento(solicitacao, controller.signal), this.timeoutMs, controller)
      pagamento.referenciaExterna = resultado.referenciaExterna
      pagamento.status = resultado.status
      pagamento.mensagem = resultado.mensagem
      pagamento.concluidoEm = resultado.processadoEm
      this.repositorio.salvar(pagamento)

      await this.pedidos.registrarResultadoPagamento(solicitacao.pedidoId, resultado.referenciaExterna, resultado.status)
      onEstado?.(resultado.status)
      return pagamento
    } catch (erro) {
      const app = paraAppError(erro)
      pagamento.status = 'ERROR'
      pagamento.mensagem =
        app.codigo === 'TIMEOUT'
          ? 'Tempo de resposta do serviço de pagamento esgotado. Nenhuma cobrança foi realizada.'
          : 'Erro ao processar pagamento. Nenhuma cobrança foi realizada.'
      pagamento.concluidoEm = agoraIso()
      this.repositorio.salvar(pagamento)
      try {
        await this.pedidos.registrarResultadoPagamento(solicitacao.pedidoId, pagamento.referenciaExterna ?? `EXT-FALHA-${pagamento.id}`, 'ERROR')
      } catch {
        /* pedido permanece AGUARDANDO_PAGAMENTO; a interface permite nova tentativa */
      }
      onEstado?.('ERROR')
      return pagamento
    }
  }

  async historico(pedidoId: number): Promise<Pagamento[]> {
    return this.repositorio.listarPorPedido(pedidoId)
  }
}
