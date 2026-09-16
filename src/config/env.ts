/**
 * Configuração de ambiente. Todas as variáveis são opcionais e possuem padrão
 * seguro para a demonstração acadêmica (fonte de dados MOCK).
 *
 *  VITE_DATA_SOURCE      'mock' | 'api'   — fonte de dados (padrão: mock)
 *  VITE_API_URL          string           — base do Back-End Spring Boot (padrão: /api → proxy do Vite)
 *  VITE_MOCK_LATENCY_MS  number           — latência simulada dos serviços mock (padrão: 500)
 *  VITE_PAYMENT_TIMEOUT_MS number         — timeout do gateway de pagamento (padrão: 8000)
 */

export type DataSource = 'mock' | 'api'

function lerNumero(valor: string | undefined, padrao: number): number {
  const n = Number(valor)
  return Number.isFinite(n) && n >= 0 ? n : padrao
}

const dataSource: DataSource = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'mock'

export const env = {
  dataSource,
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '/api',
  mockLatencyMs: lerNumero(import.meta.env.VITE_MOCK_LATENCY_MS, 500),
  paymentTimeoutMs: lerNumero(import.meta.env.VITE_PAYMENT_TIMEOUT_MS, 8000),
  isTest: import.meta.env.MODE === 'test',
} as const

export const STORAGE_KEYS = {
  sessao: 'rzn.sessao',
  carrinho: 'rzn.carrinho',
  unidade: 'rzn.unidade',
  canal: 'rzn.canal',
  consentimentoAviso: 'rzn.consentimento-aviso',
  simulacao: 'rzn.simulacao',
  mockDb: 'rzn.mock-db',
} as const
