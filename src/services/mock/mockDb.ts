import { STORAGE_KEYS } from '@/config/env'
import { clientesMock, fidelidadeMock, pagamentosMock, pedidosMock, usuariosMock, type UsuarioMock } from '@/data/mock'
import type { Cliente, Fidelidade, Pagamento, Pedido } from '@/types'
import { storage } from '@/utils/storage'

/**
 * "Banco de dados" do modo MOCK. Começa com o seed centralizado em `src/data/mock`
 * e persiste alterações no localStorage para que a demonstração sobreviva a recarregamentos.
 */
export interface MockDb {
  clientes: Cliente[]
  usuarios: UsuarioMock[]
  fidelidade: Fidelidade[]
  pedidos: Pedido[]
  pagamentos: Pagamento[]
  proximoClienteId: number
  proximoUsuarioId: number
  proximoPedidoId: number
}

function seed(): MockDb {
  return {
    clientes: structuredClone(clientesMock),
    usuarios: structuredClone(usuariosMock),
    fidelidade: structuredClone(fidelidadeMock),
    pedidos: structuredClone(pedidosMock),
    pagamentos: structuredClone(pagamentosMock),
    proximoClienteId: 3,
    proximoUsuarioId: 7,
    proximoPedidoId: 1058,
  }
}

let db: MockDb | null = null

export function obterDb(): MockDb {
  if (!db) db = storage.get<MockDb | null>(STORAGE_KEYS.mockDb, null) ?? seed()
  return db
}

export function salvarDb(): void {
  if (db) storage.set(STORAGE_KEYS.mockDb, db)
}

/** Restaura o seed (usado em testes e no botão "Reiniciar demonstração"). */
export function reiniciarDb(): void {
  db = seed()
  storage.remove(STORAGE_KEYS.mockDb)
}

// ---------------------------------------------------------------------------
// Simulação de cenários (falha de comunicação etc.) — controlada pela interface
// ---------------------------------------------------------------------------

export interface ConfigSimulacao {
  /** Faz os serviços mock falharem com erro de rede (fluxo alternativo 10 / CT17). */
  falhaComunicacao: boolean
}

export function obterSimulacao(): ConfigSimulacao {
  return storage.get<ConfigSimulacao>(STORAGE_KEYS.simulacao, { falhaComunicacao: false })
}

export function definirSimulacao(cfg: Partial<ConfigSimulacao>): ConfigSimulacao {
  const atual = { ...obterSimulacao(), ...cfg }
  storage.set(STORAGE_KEYS.simulacao, atual)
  return atual
}
