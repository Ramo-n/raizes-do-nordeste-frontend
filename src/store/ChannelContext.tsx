import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/config/env'
import type { CanalInterface, CanalPedido } from '@/types'
import { storage } from '@/utils/storage'

interface ChannelContextValue {
  canal: CanalInterface
  /** Canal do pedido enviado ao Back-End (`CanalPedido`). */
  canalPedido: CanalPedido
  definirCanal: (canal: CanalInterface) => void
  /** true quando o canal foi fixado manualmente (URL `?canal=TOTEM` ou seletor). */
  fixado: boolean
  detectarAutomaticamente: () => void
}

const ChannelContext = createContext<ChannelContextValue | null>(null)

const ROTULO: Record<CanalInterface, string> = { WEB: 'Web', APP: 'App', TOTEM: 'Totem' }
export const ROTULO_CANAL = ROTULO

function detectar(): CanalInterface {
  if (typeof window === 'undefined') return 'WEB'
  return window.matchMedia('(min-width: 1024px)').matches ? 'WEB' : 'APP'
}

function lerCanalDaUrl(): CanalInterface | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get('canal')?.toUpperCase()
  return v === 'WEB' || v === 'APP' || v === 'TOTEM' ? v : null
}

/**
 * Multicanalidade (Fase 8). Um único Front-End adapta layout, tamanho de alvos de toque
 * e fluxo conforme o canal: WEB (telas grandes), APP (mobile-first) e TOTEM (autoatendimento).
 * O canal é exposto como atributo `data-canal` no <html> para as regras de CSS.
 */
export function ChannelProvider({ children, canalInicial }: { children: ReactNode; canalInicial?: CanalInterface }) {
  const [fixado, setFixado] = useState<CanalInterface | null>(() => canalInicial ?? lerCanalDaUrl() ?? storage.get<CanalInterface | null>(STORAGE_KEYS.canal, null))
  const [detectado, setDetectado] = useState<CanalInterface>(detectar)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setDetectado(detectar())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const canal = fixado ?? detectado

  useEffect(() => {
    document.documentElement.setAttribute('data-canal', canal)
  }, [canal])

  const definirCanal = useCallback((c: CanalInterface) => {
    setFixado(c)
    storage.set(STORAGE_KEYS.canal, c)
  }, [])

  const detectarAutomaticamente = useCallback(() => {
    setFixado(null)
    storage.remove(STORAGE_KEYS.canal)
  }, [])

  const value = useMemo<ChannelContextValue>(
    () => ({ canal, canalPedido: canal, definirCanal, fixado: fixado !== null, detectarAutomaticamente }),
    [canal, definirCanal, fixado, detectarAutomaticamente],
  )
  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
}

export function useChannel(): ChannelContextValue {
  const ctx = useContext(ChannelContext)
  if (!ctx) throw new Error('useChannel deve ser usado dentro de <ChannelProvider>')
  return ctx
}
