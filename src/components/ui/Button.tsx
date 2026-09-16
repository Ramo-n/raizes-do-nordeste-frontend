import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variante = 'primario' | 'secundario' | 'contorno' | 'fantasma' | 'perigo' | 'sucesso' | 'neutro'
type Tamanho = 'normal' | 'grande' | 'pequeno'

interface BaseProps {
  variante?: Variante
  tamanho?: Tamanho
  bloco?: boolean
  carregando?: boolean
  icone?: ReactNode
  children?: ReactNode
  className?: string
}

export type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>

function classes({ variante = 'neutro', tamanho = 'normal', bloco, className }: BaseProps) {
  return [
    'btn',
    variante !== 'neutro' && `btn--${variante}`,
    tamanho === 'grande' && 'btn--grande',
    tamanho === 'pequeno' && 'btn--pequeno',
    bloco && 'btn--bloco',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

/** Botão acessível com estado de carregamento (aria-busy) e desabilitado. */
export function Button({ variante, tamanho, bloco, carregando, icone, children, className, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variante, tamanho, bloco, className })}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...rest}
    >
      {carregando ? <span className="spinner" aria-hidden="true" /> : icone}
      {children}
    </button>
  )
}

export type LinkButtonProps = BaseProps & LinkProps

/** Link estilizado como botão — para navegação (não use para ações). */
export function LinkButton({ variante, tamanho, bloco, icone, children, className, ...rest }: LinkButtonProps) {
  return (
    <Link className={classes({ variante, tamanho, bloco, className })} {...rest}>
      {icone}
      {children}
    </Link>
  )
}
