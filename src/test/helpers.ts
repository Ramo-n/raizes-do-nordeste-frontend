import { criarServicosMock, definirSimulacao, reiniciarDb } from '@/services/mock'
import type { ItemCardapio } from '@/types'

/** Serviços mock com latência mínima e banco reiniciado — base dos testes de serviço. */
export function servicosLimpos(opcoes?: { timeoutPagamentoMs?: number }) {
  localStorage.clear()
  reiniciarDb()
  definirSimulacao({ falhaComunicacao: false })
  return criarServicosMock({ latenciaPagamentoMs: 5, timeoutPagamentoMs: opcoes?.timeoutPagamentoMs ?? 2000 })
}

export const CREDENCIAIS_VALIDAS = { email: 'maria@exemplo.com', senha: '123456' }

export function itemCardapio(sobrescrever: Partial<ItemCardapio> = {}): ItemCardapio {
  return {
    produtoId: 1,
    nome: 'Tapioca de queijo coalho',
    descricao: 'Tapioca com queijo coalho',
    categoria: 'Tapiocas',
    preco: 12,
    variacaoRegional: null,
    sazonal: false,
    disponivel: true,
    imagem: '🫓',
    ingredientes: [],
    alergenos: [],
    tempoPreparoMin: 8,
    ...sobrescrever,
  }
}
