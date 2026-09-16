import { formatarMoeda } from '@/utils/format'

interface OrderSummaryProps {
  subtotal: number
  descontoFidelidade?: number
  descontoPromocao?: number
  rotuloPromocao?: string | null
  total: number
}

/** Resumo financeiro (RN03): quantidade × preço, benefícios e total. */
export function OrderSummary({ subtotal, descontoFidelidade = 0, descontoPromocao = 0, rotuloPromocao, total }: OrderSummaryProps) {
  return (
    <dl className="resumo" aria-label="Resumo do pedido">
      <div className="resumo__linha">
        <dt>Subtotal</dt>
        <dd>{formatarMoeda(subtotal)}</dd>
      </div>
      {descontoFidelidade > 0 && (
        <div className="resumo__linha resumo__desconto">
          <dt>Desconto fidelidade</dt>
          <dd>− {formatarMoeda(descontoFidelidade)}</dd>
        </div>
      )}
      {descontoPromocao > 0 && (
        <div className="resumo__linha resumo__desconto">
          <dt>Promoção {rotuloPromocao ? `(${rotuloPromocao})` : ''}</dt>
          <dd>− {formatarMoeda(descontoPromocao)}</dd>
        </div>
      )}
      <div className="resumo__linha resumo__linha--total">
        <dt>Total</dt>
        <dd>{formatarMoeda(total)}</dd>
      </div>
    </dl>
  )
}
