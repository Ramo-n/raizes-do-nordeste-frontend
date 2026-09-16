import type { ReactNode } from 'react'
import type { AppError } from '@/services/errors'
import { Button } from './Button'

/** Estado LOADING (RNF10) — anuncia para leitores de tela via aria-live. */
export function LoadingState({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <div className="estado" role="status" aria-live="polite">
      <span className="spinner spinner--grande" aria-hidden="true" />
      <p className="estado__descricao">{mensagem}</p>
    </div>
  )
}

interface EmptyStateProps {
  titulo: string
  descricao?: string
  icone?: string
  acao?: ReactNode
}

/** Estado EMPTY (RNF10). */
export function EmptyState({ titulo, descricao, icone = '🗒️', acao }: EmptyStateProps) {
  return (
    <div className="estado" role="status">
      <span className="estado__icone" aria-hidden="true">
        {icone}
      </span>
      <h2 className="estado__titulo">{titulo}</h2>
      {descricao && <p className="estado__descricao">{descricao}</p>}
      {acao}
    </div>
  )
}

interface ErrorStateProps {
  erro?: AppError | Error | null
  titulo?: string
  descricao?: string
  aoTentarNovamente?: () => void
  acao?: ReactNode
}

/** Estado ERROR (RNF09/RNF10) com ação de nova tentativa. */
export function ErrorState({ erro, titulo = 'Algo deu errado', descricao, aoTentarNovamente, acao }: ErrorStateProps) {
  return (
    <div className="estado estado--erro" role="alert">
      <span className="estado__icone" aria-hidden="true">
        ⚠️
      </span>
      <h2 className="estado__titulo">{titulo}</h2>
      <p className="estado__descricao">{descricao ?? erro?.message ?? 'Não foi possível concluir a operação.'}</p>
      <div className="linha">
        {aoTentarNovamente && (
          <Button variante="primario" onClick={aoTentarNovamente}>
            Tentar novamente
          </Button>
        )}
        {acao}
      </div>
    </div>
  )
}

type TipoAlerta = 'info' | 'sucesso' | 'erro' | 'alerta'

const ICONE_ALERTA: Record<TipoAlerta, string> = { info: 'ℹ️', sucesso: '✅', erro: '⛔', alerta: '⚠️' }

interface AlertProps {
  tipo?: TipoAlerta
  titulo?: string
  children: ReactNode
  role?: 'alert' | 'status' | 'note'
}

/** Mensagem contextual; erros usam role="alert" para anúncio imediato. */
export function Alert({ tipo = 'info', titulo, children, role }: AlertProps) {
  const papel = role ?? (tipo === 'erro' ? 'alert' : 'status')
  return (
    <div className={`alerta alerta--${tipo}`} role={papel}>
      <span className="alerta__icone" aria-hidden="true">
        {ICONE_ALERTA[tipo]}
      </span>
      <div className="alerta__corpo">
        {titulo && <p className="alerta__titulo">{titulo}</p>}
        {typeof children === 'string' ? <p>{children}</p> : children}
      </div>
    </div>
  )
}

type TipoChip = 'neutro' | 'sucesso' | 'erro' | 'alerta' | 'info' | 'primario' | 'ouro'

export function Chip({ tipo = 'neutro', children }: { tipo?: TipoChip; children: ReactNode }) {
  return <span className={['chip', tipo !== 'neutro' && `chip--${tipo}`].filter(Boolean).join(' ')}>{children}</span>
}
