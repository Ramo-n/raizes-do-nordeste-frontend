import { useToast, type TipoToast } from '@/store/ToastContext'

const ICONE: Record<TipoToast, string> = { sucesso: '✅', erro: '⛔', info: 'ℹ️', alerta: '⚠️' }

/** Região de notificações (Toast/Notification). Erros usam role="alert"; demais, status. */
export function Toasts() {
  const { toasts, fechar } = useToast()
  return (
    <div className="toasts" aria-label="Notificações">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tipo}`} role={t.tipo === 'erro' ? 'alert' : 'status'}>
          <span aria-hidden="true">{ICONE[t.tipo]}</span>
          <span className="toast__mensagem">{t.mensagem}</span>
          <button type="button" className="toast__fechar" onClick={() => fechar(t.id)} aria-label="Fechar notificação">
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
