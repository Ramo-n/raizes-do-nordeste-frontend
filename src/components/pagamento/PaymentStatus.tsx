import type { ReactNode } from 'react'
import { TEXTOS_PAGAMENTO, type EstadoPagamentoUI } from './textosPagamento'

interface PaymentStatusProps {
  estado: Exclude<EstadoPagamentoUI, 'IDLE'>
  mensagem?: string | null
  referencia?: string | null
  tentativa?: number
  acoes?: ReactNode
}

/** RF15 — Retorno visual do processamento do pagamento. Anuncia mudanças por aria-live. */
export function PaymentStatus({ estado, mensagem, referencia, tentativa, acoes }: PaymentStatusProps) {
  const t = TEXTOS_PAGAMENTO[estado]
  const processando = estado === 'REQUESTED' || estado === 'PENDING'
  return (
    <section className={`pagamento-status pagamento-status--${estado}`} role={estado === 'DECLINED' || estado === 'ERROR' ? 'alert' : 'status'} aria-live="polite" aria-busy={processando}>
      <span className="pagamento-status__icone" aria-hidden="true">
        {processando ? <span className="spinner spinner--grande" /> : t.icone}
      </span>
      <h2 className="pagamento-status__titulo">{t.titulo}</h2>
      <p className="texto-suave">{mensagem || t.descricao}</p>
      {(referencia || tentativa) && (
        <p className="texto-pequeno texto-suave">
          {tentativa ? `Tentativa ${tentativa}` : null}
          {tentativa && referencia ? ' · ' : null}
          {referencia ? `Ref. externa: ${referencia}` : null}
        </p>
      )}
      {acoes && <div className="linha mt-4" style={{ justifyContent: 'center' }}>{acoes}</div>}
    </section>
  )
}
