import { Chip } from '@/components/ui'
import type { Pedido, StatusPedido } from '@/types'
import { formatarHora } from '@/utils/format'
import { ROTULO_STATUS } from './pedidoStatus'

const DESCRICAO_STATUS: Record<StatusPedido, string> = {
  CRIADO: 'Pedido registrado.',
  AGUARDANDO_PAGAMENTO: 'Aguardando a confirmação do serviço de pagamento.',
  PAGO: 'Pagamento aprovado. O pedido foi enviado para a cozinha.',
  EM_PREPARO: 'A cozinha está preparando seus itens.',
  PRONTO: 'Seu pedido está pronto! Apresente o código na retirada.',
  ENTREGUE: 'Pedido retirado. Bom apetite!',
  CANCELADO: 'Pedido cancelado.',
  PAGAMENTO_RECUSADO: 'O pagamento não foi autorizado. Tente novamente.',
}

const ETAPAS: StatusPedido[] = ['AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE']

export function StatusChip({ status }: { status: StatusPedido }) {
  const tipo = status === 'PRONTO' || status === 'ENTREGUE' || status === 'PAGO' ? 'sucesso' : status === 'EM_PREPARO' ? 'info' : status === 'CANCELADO' || status === 'PAGAMENTO_RECUSADO' ? 'erro' : 'alerta'
  return <Chip tipo={tipo}>{ROTULO_STATUS[status]}</Chip>
}

/** RF10 — Acompanhamento do status (timeline). Não depende só de cor: usa ícone, texto e aria-current. */
export function OrderStatus({ pedido }: { pedido: Pedido }) {
  const idxAtual = ETAPAS.indexOf(pedido.status)
  const falhou = pedido.status === 'CANCELADO' || pedido.status === 'PAGAMENTO_RECUSADO'
  const horaDe = (s: StatusPedido) => pedido.historicoStatus.find((h) => h.status === s)?.em

  return (
    <div>
      <p className="texto-suave" role="status" aria-live="polite">
        {DESCRICAO_STATUS[pedido.status]}
      </p>
      <ol className="timeline" aria-label="Etapas do pedido">
        {ETAPAS.map((etapa, i) => {
          const feito = !falhou && i < idxAtual
          const atual = etapa === pedido.status || (falhou && etapa === 'AGUARDANDO_PAGAMENTO')
          const cls = ['timeline__passo', feito && 'timeline__passo--feito', atual && !falhou && 'timeline__passo--atual', atual && falhou && 'timeline__passo--erro'].filter(Boolean).join(' ')
          const hora = horaDe(etapa)
          return (
            <li key={etapa} className={cls} aria-current={atual ? 'step' : undefined}>
              <span className="timeline__marcador" aria-hidden="true">
                {feito ? '✓' : atual ? (falhou ? '!' : '●') : i + 1}
              </span>
              <div>
                <p className="timeline__titulo">
                  {falhou && atual ? ROTULO_STATUS[pedido.status] : ROTULO_STATUS[etapa]}
                  <span className="sr-only">{feito ? ' (concluído)' : atual ? ' (etapa atual)' : ' (pendente)'}</span>
                </p>
                {hora && <p className="timeline__hora">{formatarHora(hora)}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
