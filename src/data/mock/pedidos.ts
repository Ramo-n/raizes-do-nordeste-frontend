import type { FormaPagamento, Pagamento, Pedido, StatusPedido } from '@/types'

/** Pedidos históricos do cliente Maria (id 1) para popular "Meus pedidos" e o painel operacional. */
export const pedidosMock: Pedido[] = [
  {
    id: 1042,
    unidadeId: 2,
    clienteId: 1,
    canalPedido: 'APP',
    status: 'ENTREGUE',
    dataHora: '2026-05-02T09:40:00',
    valorBruto: 43,
    desconto: 0,
    valorTotal: 43,
    itens: [
      { produtoId: 1, nomeProduto: 'Tapioca de queijo coalho', quantidade: 2, precoUnitario: 14 },
      { produtoId: 4, nomeProduto: 'Suco de cajá', quantidade: 1, precoUnitario: 9 },
      { produtoId: 2, nomeProduto: 'Cuscuz recheado', quantidade: 1, precoUnitario: 12 },
    ],
    formaRetirada: 'BALCAO',
    nomeRetirada: 'Maria',
    codigoRetirada: 'RZ-1042',
    descontoFidelidade: 0,
    descontoPromocao: 0,
    codigoPromocao: null,
    pontosGanhos: 43,
    historicoStatus: [
      { status: 'AGUARDANDO_PAGAMENTO', em: '2026-05-02T09:40:00' },
      { status: 'PAGO', em: '2026-05-02T09:40:20' },
      { status: 'EM_PREPARO', em: '2026-05-02T09:41:00' },
      { status: 'PRONTO', em: '2026-05-02T09:52:00' },
      { status: 'ENTREGUE', em: '2026-05-02T09:55:00' },
    ],
  },
  {
    id: 1057,
    unidadeId: 1,
    clienteId: 2,
    canalPedido: 'TOTEM',
    status: 'EM_PREPARO',
    dataHora: '2026-09-14T08:05:00',
    valorBruto: 22,
    desconto: 0,
    valorTotal: 22,
    itens: [
      { produtoId: 2, nomeProduto: 'Cuscuz recheado', quantidade: 1, precoUnitario: 10 },
      { produtoId: 1, nomeProduto: 'Tapioca de queijo coalho', quantidade: 1, precoUnitario: 12 },
    ],
    formaRetirada: 'MESA',
    nomeRetirada: 'João',
    codigoRetirada: 'RZ-1057',
    descontoFidelidade: 0,
    descontoPromocao: 0,
    codigoPromocao: null,
    pontosGanhos: 0,
    historicoStatus: [
      { status: 'AGUARDANDO_PAGAMENTO', em: '2026-09-14T08:05:00' },
      { status: 'PAGO', em: '2026-09-14T08:05:30' },
      { status: 'EM_PREPARO', em: '2026-09-14T08:06:00' },
    ],
  },
]

export const pagamentosMock: Pagamento[] = [
  {
    id: 'pag-1042-1',
    pedidoId: 1042,
    forma: 'PIX',
    valor: 43,
    tentativa: 1,
    referenciaExterna: 'EXT-8a1c2e0f-1042',
    provedor: 'provedor-simulado',
    status: 'APPROVED',
    mensagem: 'Pagamento aprovado',
    solicitadoEm: '2026-05-02T09:40:05',
    concluidoEm: '2026-05-02T09:40:20',
  },
]

/** Sequência operacional de status (após PAGO) — igual a `PedidoService.avancarStatus` do Back-End. */
export const SEQUENCIA_STATUS: StatusPedido[] = ['PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE']

export const ROTULO_STATUS_PEDIDO: Record<StatusPedido, string> = {
  CRIADO: 'Pedido criado',
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGO: 'Pedido confirmado',
  EM_PREPARO: 'Em preparação',
  PRONTO: 'Pronto para retirada',
  ENTREGUE: 'Retirado',
  CANCELADO: 'Cancelado',
  PAGAMENTO_RECUSADO: 'Pagamento recusado',
}

export const ROTULO_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  VALE_REFEICAO: 'Vale-refeição',
}
