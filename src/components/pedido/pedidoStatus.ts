import type { StatusPedido } from '@/types'

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  CRIADO: 'Criado',
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGO: 'Pedido confirmado',
  EM_PREPARO: 'Em preparação',
  PRONTO: 'Pronto para retirada',
  ENTREGUE: 'Retirado',
  CANCELADO: 'Cancelado',
  PAGAMENTO_RECUSADO: 'Pagamento recusado',
}
