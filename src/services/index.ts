import { env } from '@/config/env'
import type { Servicos } from './contracts'
import { criarServicosApi } from './api'
import { criarServicosMock } from './mock'

/**
 * Fábrica da camada de serviços. A interface consome apenas `servicos`;
 * a origem dos dados (Mock ou Back-End) é definida por `VITE_DATA_SOURCE`.
 */
export const servicos: Servicos = env.dataSource === 'api' ? criarServicosApi() : criarServicosMock()

export type { Servicos } from './contracts'
export * from './errors'
