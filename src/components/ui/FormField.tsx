import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  /** Finalidade do dado (LGPD — transparência na coleta). */
  ajuda?: ReactNode
  erro?: string | null
  obrigatorio?: boolean
}

/**
 * Campo de formulário acessível: label associado, ajuda e erro ligados por aria-describedby,
 * aria-invalid quando houver erro. Erros são anunciados via role="alert".
 */
export function FormField({ label, ajuda, erro, obrigatorio, className, ...input }: FormFieldProps) {
  const id = useId()
  const ajudaId = `${id}-ajuda`
  const erroId = `${id}-erro`
  const describedBy = [ajuda ? ajudaId : null, erro ? erroId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={['campo', className].filter(Boolean).join(' ')}>
      <label className="campo__label" htmlFor={id}>
        {label}
        {obrigatorio && (
          <span aria-hidden="true" style={{ color: 'var(--cor-erro)' }}>
            {' '}
            *
          </span>
        )}
      </label>
      <input
        id={id}
        className="campo__input"
        aria-describedby={describedBy}
        aria-invalid={erro ? true : undefined}
        aria-required={obrigatorio || undefined}
        {...input}
      />
      {ajuda && (
        <p id={ajudaId} className="campo__ajuda">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={erroId} className="campo__erro" role="alert">
          <span aria-hidden="true">⚠</span> {erro}
        </p>
      )}
    </div>
  )
}

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: ReactNode
  erro?: string | null
}

export function CheckboxField({ label, erro, ...input }: CheckboxFieldProps) {
  const id = useId()
  const erroId = `${id}-erro`
  return (
    <div>
      <div className="campo campo--check" data-invalido={erro ? 'true' : undefined}>
        <input id={id} type="checkbox" aria-describedby={erro ? erroId : undefined} aria-invalid={erro ? true : undefined} {...input} />
        <label htmlFor={id}>{label}</label>
      </div>
      {erro && (
        <p id={erroId} className="campo__erro" role="alert" style={{ marginTop: 'var(--esp-1)' }}>
          <span aria-hidden="true">⚠</span> {erro}
        </p>
      )}
    </div>
  )
}
