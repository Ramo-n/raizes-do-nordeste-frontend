/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE?: 'mock' | 'api'
  readonly VITE_API_URL?: string
  readonly VITE_MOCK_LATENCY_MS?: string
  readonly VITE_PAYMENT_TIMEOUT_MS?: string
}
