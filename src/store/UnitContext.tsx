import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/config/env'
import type { Unidade } from '@/types'
import { storage } from '@/utils/storage'

interface UnitContextValue {
  unidade: Unidade | null
  selecionar: (unidade: Unidade) => void
  limpar: () => void
}

const UnitContext = createContext<UnitContextValue | null>(null)

/** Unidade escolhida pelo cliente (RN01 — todo pedido pertence a uma unidade). */
export function UnitProvider({ children }: { children: ReactNode }) {
  const [unidade, setUnidade] = useState<Unidade | null>(() => storage.get<Unidade | null>(STORAGE_KEYS.unidade, null))

  const selecionar = useCallback((u: Unidade) => {
    setUnidade(u)
    storage.set(STORAGE_KEYS.unidade, u)
  }, [])

  const limpar = useCallback(() => {
    setUnidade(null)
    storage.remove(STORAGE_KEYS.unidade)
  }, [])

  const value = useMemo(() => ({ unidade, selecionar, limpar }), [unidade, selecionar, limpar])
  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>
}

export function useUnit(): UnitContextValue {
  const ctx = useContext(UnitContext)
  if (!ctx) throw new Error('useUnit deve ser usado dentro de <UnitProvider>')
  return ctx
}
