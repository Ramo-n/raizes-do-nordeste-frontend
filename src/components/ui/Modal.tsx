import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  aberto: boolean
  titulo: string
  aoFechar: () => void
  children: ReactNode
  acoes?: ReactNode
}

/**
 * Modal acessível: role="dialog", aria-modal, título associado, fecha com Esc e clique fora,
 * foca o primeiro elemento ao abrir e devolve o foco ao fechar.
 */
export function Modal({ aberto, titulo, aoFechar, children, acoes }: ModalProps) {
  const tituloId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const focoAnterior = useRef<Element | null>(null)

  useEffect(() => {
    if (!aberto) return
    focoAnterior.current = document.activeElement
    const foco = ref.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    foco?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
      if (e.key === 'Tab' && ref.current) {
        const focaveis = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (focaveis.length === 0) return
        const primeiro = focaveis[0]
        const ultimo = focaveis[focaveis.length - 1]
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault()
          ultimo.focus()
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault()
          primeiro.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (focoAnterior.current instanceof HTMLElement) focoAnterior.current.focus()
    }
  }, [aberto, aoFechar])

  if (!aberto) return null

  return (
    <div className="modal__overlay" onClick={aoFechar} data-testid="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={tituloId} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="modal__cabecalho">
          <h2 id={tituloId}>{titulo}</h2>
          <Button variante="fantasma" className="btn--icone" onClick={aoFechar} aria-label="Fechar">
            ✕
          </Button>
        </div>
        <div>{children}</div>
        {acoes && <div className="modal__acoes">{acoes}</div>}
      </div>
    </div>
  )
}
