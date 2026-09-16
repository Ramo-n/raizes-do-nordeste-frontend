import type { StatusGatewayPagamento } from '@/types'

export type EstadoPagamentoUI = 'IDLE' | 'REQUESTED' | StatusGatewayPagamento

/** Textos exigidos pelo roteiro (Fase 7). */
export const TEXTOS_PAGAMENTO: Record<Exclude<EstadoPagamentoUI, 'IDLE'>, { titulo: string; icone: string; descricao: string }> = {
  REQUESTED: { titulo: 'Pagamento solicitado', icone: '📨', descricao: 'Enviando solicitação ao serviço de pagamento externo.' },
  PENDING: { titulo: 'Processando pagamento...', icone: '⏳', descricao: 'Aguardando resposta do provedor. Não feche esta tela.' },
  APPROVED: { titulo: 'Pagamento aprovado', icone: '✅', descricao: 'Seu pedido foi confirmado e enviado para a cozinha.' },
  DECLINED: { titulo: 'Pagamento recusado', icone: '❌', descricao: 'O provedor não autorizou o pagamento. Você pode tentar novamente com outra forma.' },
  ERROR: { titulo: 'Erro ao processar pagamento', icone: '⚠️', descricao: 'Falha de comunicação com o serviço de pagamento. Nenhuma cobrança foi realizada.' },
}
