/** Acesso seguro ao localStorage (falha silenciosa em modo privado / SSR / testes sem storage). */
export const storage = {
  get<T>(chave: string, padrao: T): T {
    try {
      const bruto = globalThis.localStorage?.getItem(chave)
      return bruto ? (JSON.parse(bruto) as T) : padrao
    } catch {
      return padrao
    }
  },
  set<T>(chave: string, valor: T): void {
    try {
      globalThis.localStorage?.setItem(chave, JSON.stringify(valor))
    } catch {
      /* ignora: cota excedida ou storage indisponível */
    }
  },
  remove(chave: string): void {
    try {
      globalThis.localStorage?.removeItem(chave)
    } catch {
      /* ignora */
    }
  },
}
