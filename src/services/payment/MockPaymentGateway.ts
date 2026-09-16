import type { PaymentGateway } from '@/services/contracts'
import type { CenarioSimulacaoPagamento, ResultadoPagamento, SolicitacaoPagamento } from '@/types'
import { aguardar, agoraIso } from '@/utils/async'
import { ErroRede } from '@/services/errors'

/**
 * Gateway externo de pagamento SIMULADO (Fase 7 do roteiro).
 *
 * - Não processa valores reais e não recebe dados financeiros (RN05).
 * - Gera uma referência externa no mesmo formato do Back-End (`EXT-<uuid>`).
 * - O cenário pode ser informado pela interface (modo demonstração) ou, na
 *   ausência, sorteado com pesos realistas (aprovação majoritária).
 * - Para trocar por um provedor real basta implementar `PaymentGateway`
 *   com chamadas HTTP e registrar em `services/payment/index.ts`.
 */
export class MockPaymentGateway implements PaymentGateway {
  constructor(
    private readonly latenciaMs = 1800,
    private readonly sortear: () => number = Math.random,
  ) {}

  nomeProvedor(): string {
    return 'provedor-simulado'
  }

  async solicitarPagamento(solicitacao: SolicitacaoPagamento, signal?: AbortSignal): Promise<ResultadoPagamento> {
    const cenario = solicitacao.cenario ?? this.sortearCenario()

    if (cenario === 'TIMEOUT') {
      // Nunca responde — o serviço de pagamento aplicará o timeout configurado.
      await aguardar(Number.POSITIVE_INFINITY, signal)
    }

    await aguardar(this.latenciaMs, signal)

    if (cenario === 'ERRO') {
      throw new ErroRede('Serviço de pagamento indisponível no momento.')
    }

    const referenciaExterna = `EXT-${gerarUuid()}`
    const processadoEm = agoraIso()

    if (cenario === 'RECUSADO') {
      return {
        referenciaExterna,
        provedor: this.nomeProvedor(),
        status: 'DECLINED',
        mensagem: 'Pagamento recusado pelo emissor. Verifique a forma de pagamento e tente novamente.',
        codigoRetorno: '51',
        processadoEm,
      }
    }

    return {
      referenciaExterna,
      provedor: this.nomeProvedor(),
      status: 'APPROVED',
      mensagem: 'Pagamento aprovado',
      codigoRetorno: '00',
      processadoEm,
    }
  }

  private sortearCenario(): CenarioSimulacaoPagamento {
    const r = this.sortear()
    if (r < 0.8) return 'APROVADO'
    if (r < 0.93) return 'RECUSADO'
    return 'ERRO'
  }
}

function gerarUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
