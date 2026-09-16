import { env, STORAGE_KEYS } from '@/config/env'
import { AppError, ErroNaoAutenticado, ErroNaoEncontrado, ErroNegocio, ErroRede, ErroTimeout, ErroValidacao } from '@/services/errors'
import type { Sessao } from '@/types'
import { storage } from '@/utils/storage'

/** Corpo de erro padronizado pelo `ApiExceptionHandler` do Back-End. */
interface ErroApi {
  timestamp?: string
  status?: number
  mensagem?: string
}

export interface OpcoesHttp {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  corpo?: unknown
  timeoutMs?: number
  autenticar?: boolean
}

/**
 * Cliente HTTP mínimo (fetch) com: JSON, Bearer token da sessão, timeout via AbortController
 * e tradução dos erros HTTP do Back-End para `AppError`.
 */
export async function http<T>(caminho: string, opcoes: OpcoesHttp = {}): Promise<T> {
  const { metodo = 'GET', corpo, timeoutMs = 10_000, autenticar = true } = opcoes
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (corpo !== undefined) headers['Content-Type'] = 'application/json'
  if (autenticar) {
    const sessao = storage.get<Sessao | null>(STORAGE_KEYS.sessao, null)
    if (sessao?.accessToken) headers.Authorization = `Bearer ${sessao.accessToken}`
  }

  let resposta: Response
  try {
    resposta = await fetch(`${env.apiUrl}${caminho}`, {
      method: metodo,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controller.signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new ErroTimeout()
    throw new ErroRede()
  } finally {
    clearTimeout(timer)
  }

  if (resposta.ok) {
    if (resposta.status === 204) return undefined as T
    return (await resposta.json()) as T
  }

  let erro: ErroApi = {}
  try {
    erro = (await resposta.json()) as ErroApi
  } catch {
    /* corpo vazio */
  }
  const msg = erro.mensagem
  switch (resposta.status) {
    case 400:
      throw new ErroValidacao(msg ?? 'Requisição inválida.')
    case 401:
      throw new ErroNaoAutenticado(msg ?? 'Autenticação necessária ou credenciais inválidas.')
    case 403:
      throw new AppError('SEM_PERMISSAO', msg ?? 'Você não tem permissão para esta operação.')
    case 404:
      throw new ErroNaoEncontrado(msg ?? 'Recurso não encontrado.')
    case 422:
      throw new ErroNegocio(msg ?? 'Operação não permitida pelas regras de negócio.')
    default:
      throw new AppError('DESCONHECIDO', msg ?? `Erro inesperado (${resposta.status}).`)
  }
}
