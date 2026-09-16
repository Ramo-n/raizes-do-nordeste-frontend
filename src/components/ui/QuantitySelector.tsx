import { QUANTIDADE_MAXIMA } from '@/store/CartContext'

interface QuantitySelectorProps {
  valor: number
  aoAlterar: (novo: number) => void
  minimo?: number
  maximo?: number
  rotulo?: string
  desabilitado?: boolean
}

/** Controle de quantidade com botões grandes (toque) e valor anunciado por aria-live. */
export function QuantitySelector({ valor, aoAlterar, minimo = 1, maximo = QUANTIDADE_MAXIMA, rotulo = 'Quantidade', desabilitado }: QuantitySelectorProps) {
  return (
    <div className="quantidade" role="group" aria-label={rotulo}>
      <button
        type="button"
        className="quantidade__btn"
        onClick={() => aoAlterar(valor - 1)}
        disabled={desabilitado || valor <= minimo}
        aria-label={`Diminuir ${rotulo.toLowerCase()}`}
      >
        −
      </button>
      <span className="quantidade__valor" aria-live="polite" aria-atomic="true">
        {valor}
      </span>
      <button
        type="button"
        className="quantidade__btn"
        onClick={() => aoAlterar(valor + 1)}
        disabled={desabilitado || valor >= maximo}
        aria-label={`Aumentar ${rotulo.toLowerCase()}`}
      >
        +
      </button>
    </div>
  )
}
