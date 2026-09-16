import type { CardapioService, UnidadeService } from '@/services/contracts'
import { ErroNaoEncontrado, ErroNegocio } from '@/services/errors'
import { categoriasMock, montarCardapio, unidadesMock } from '@/data/mock'
import type { Categoria, ItemCardapio, Unidade } from '@/types'
import { simularRede } from './base'

export class UnidadeServiceMock implements UnidadeService {
  async listar(): Promise<Unidade[]> {
    await simularRede()
    return structuredClone(unidadesMock)
  }

  async obter(id: number): Promise<Unidade> {
    await simularRede()
    const u = unidadesMock.find((x) => x.id === id)
    if (!u) throw new ErroNaoEncontrado(`Unidade não encontrada: ${id}`)
    return structuredClone(u)
  }
}

export class CardapioServiceMock implements CardapioService {
  async listarCategorias(): Promise<Categoria[]> {
    await simularRede(0)
    return structuredClone(categoriasMock)
  }

  async cardapioDaUnidade(unidadeId: number): Promise<ItemCardapio[]> {
    await simularRede()
    const unidade = unidadesMock.find((u) => u.id === unidadeId)
    if (!unidade) throw new ErroNaoEncontrado(`Unidade não encontrada: ${unidadeId}`)
    if (unidade.statusOperacional === 'INDISPONIVEL') {
      throw new ErroNegocio('Esta unidade está temporariamente indisponível. Escolha outra unidade para continuar.')
    }
    return montarCardapio(unidadeId)
  }

  async obterItem(unidadeId: number, produtoId: number): Promise<ItemCardapio> {
    await simularRede()
    const item = montarCardapio(unidadeId).find((i) => i.produtoId === produtoId)
    if (!item) throw new ErroNaoEncontrado('Produto não encontrado no cardápio desta unidade.')
    return item
  }
}
