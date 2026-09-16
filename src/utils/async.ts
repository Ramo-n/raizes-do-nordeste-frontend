import { ErroTimeout } from '@/services/errors'

export function aguardar(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ErroTimeout())
      return
    }
    // `ms` infinito = nunca resolve (só encerra via abort). Evita o clamp de setTimeout para atrasos > 2^31-1 ms.
    const t = Number.isFinite(ms) ? setTimeout(resolve, ms) : undefined
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(new ErroTimeout())
      },
      { once: true },
    )
  })
}

/** Rejeita com `ErroTimeout` se a promise não resolver dentro do prazo. */
export function comTimeout<T>(promise: Promise<T>, ms: number, controller?: AbortController): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      controller?.abort()
      reject(new ErroTimeout())
    }, ms)
    promise.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      },
    )
  })
}

export function gerarId(prefixo: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefixo}-${Date.now().toString(36)}-${rand}`
}

export function agoraIso(): string {
  return new Date().toISOString()
}
