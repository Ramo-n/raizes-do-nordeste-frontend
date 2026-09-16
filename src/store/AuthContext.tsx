import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { servicos } from '@/services'
import type { Cliente, CredenciaisLogin, NovoCliente, Sessao } from '@/types'

interface AuthContextValue {
  sessao: Sessao | null
  autenticado: boolean
  ehCliente: boolean
  ehOperacional: boolean // ATENDENTE / GERENTE / MATRIZ
  entrar: (credenciais: CredenciaisLogin) => Promise<Sessao>
  cadastrar: (dados: NovoCliente) => Promise<Sessao>
  sair: () => void
  atualizarCliente: (cliente: Cliente) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => servicos.auth.sessaoAtual())

  const entrar = useCallback(async (credenciais: CredenciaisLogin) => {
    const s = await servicos.auth.login(credenciais)
    setSessao(s)
    return s
  }, [])

  const cadastrar = useCallback(async (dados: NovoCliente) => {
    const s = await servicos.auth.cadastrar(dados)
    setSessao(s)
    return s
  }, [])

  const sair = useCallback(() => {
    servicos.auth.sair()
    setSessao(null)
  }, [])

  const atualizarCliente = useCallback((cliente: Cliente) => {
    setSessao((s) => (s ? { ...s, cliente } : s))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      sessao,
      autenticado: sessao !== null,
      ehCliente: sessao?.role === 'CLIENTE',
      ehOperacional: sessao?.role === 'ATENDENTE' || sessao?.role === 'GERENTE' || sessao?.role === 'MATRIZ',
      entrar,
      cadastrar,
      sair,
      atualizarCliente,
    }),
    [sessao, entrar, cadastrar, sair, atualizarCliente],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
