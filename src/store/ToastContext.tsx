import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type TipoToast = 'sucesso' | 'erro' | 'info' | 'alerta'

export interface Toast {
  id: number
  tipo: TipoToast
  mensagem: string
}

interface ToastContextValue {
  toasts: Toast[]
  notificar: (mensagem: string, tipo?: TipoToast) => void
  fechar: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** Feedback visual não bloqueante das ações (RNF08). */
export function ToastProvider({ children, duracaoMs = 4000 }: { children: ReactNode; duracaoMs?: number }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const proximoId = useRef(1)

  const fechar = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const notificar = useCallback(
    (mensagem: string, tipo: TipoToast = 'info') => {
      const id = proximoId.current++
      setToasts((t) => [...t.slice(-2), { id, tipo, mensagem }])
      if (duracaoMs > 0) setTimeout(() => fechar(id), duracaoMs)
    },
    [duracaoMs, fechar],
  )

  const value = useMemo(() => ({ toasts, notificar, fechar }), [toasts, notificar, fechar])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}
