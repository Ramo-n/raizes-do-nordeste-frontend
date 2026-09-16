import { env } from '@/config/env'
import { ErroRede } from '@/services/errors'
import { aguardar } from '@/utils/async'
import { obterSimulacao } from './mockDb'

/**
 * Simula a latência de rede e o cenário "falha de comunicação".
 * Todos os métodos dos serviços mock começam com `await simularRede()`.
 */
export async function simularRede(latenciaMs: number = env.mockLatencyMs): Promise<void> {
  if (latenciaMs > 0) await aguardar(latenciaMs)
  if (obterSimulacao().falhaComunicacao) throw new ErroRede()
}
