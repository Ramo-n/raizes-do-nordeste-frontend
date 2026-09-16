import { useCallback, useEffect, useRef, useState } from 'react'
import { paraAppError, type AppError } from '@/services/errors'
import type { EstadoAssincrono } from '@/types'

export interface ResultadoAsync<T> {
  estado: EstadoAssincrono
  dados: T | null
  erro: AppError | null
  recarregar: () => void
}

/**
 * Hook genérico para carregar dados com os estados LOADING / SUCCESS / EMPTY / ERROR (RNF10).
 * `estaVazio` permite que a tela decida quando o resultado deve ser tratado como vazio.
 */
export function useAsync<T>(
  carregar: () => Promise<T>,
  deps: readonly unknown[],
  opcoes?: { estaVazio?: (dados: T) => boolean; habilitado?: boolean },
): ResultadoAsync<T> {
  const [estado, setEstado] = useState<EstadoAssincrono>('idle')
  const [dados, setDados] = useState<T | null>(null)
  const [erro, setErro] = useState<AppError | null>(null)
  const [versao, setVersao] = useState(0)
  const habilitado = opcoes?.habilitado ?? true
  const estaVazio = opcoes?.estaVazio
  const carregarRef = useRef(carregar)
  carregarRef.current = carregar

  useEffect(() => {
    if (!habilitado) return
    let ativo = true
    // Mantém os dados atuais visíveis durante recargas (polling); só mostra LOADING sem dados/após erro.
    setEstado((s) => (s === 'success' || s === 'empty' ? s : 'loading'))
    setErro(null)
    carregarRef
      .current()
      .then((r) => {
        if (!ativo) return
        setDados(r)
        setEstado(estaVazio?.(r) ? 'empty' : 'success')
      })
      .catch((e: unknown) => {
        if (!ativo) return
        setErro(paraAppError(e))
        setEstado('error')
      })
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao, habilitado])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  return { estado, dados, erro, recarregar }
}
