import { describe, expect, it } from 'vitest'
import { QUANTIDADE_MAXIMA, cartReducer } from '@/store/CartContext'
import { itemCardapio } from '@/test/helpers'

const vazio = { unidadeId: null, itens: [] }

describe('UC06 — Gerenciar Carrinho (RF06, RF07, RF08)', () => {
  it('CT07 — adicionar produto cria item; adicionar novamente soma quantidade', () => {
    const s1 = cartReducer(vazio, { type: 'adicionar', unidadeId: 1, item: itemCardapio(), quantidade: 1 })
    expect(s1.itens).toHaveLength(1)
    expect(s1.unidadeId).toBe(1)
    const s2 = cartReducer(s1, { type: 'adicionar', unidadeId: 1, item: itemCardapio(), quantidade: 2 })
    expect(s2.itens[0].quantidade).toBe(3)
    expect(s2.itens[0].precoUnitario).toBe(12)
  })

  it('CT07b — alterar quantidade respeita o máximo e remover/zerar exclui o item', () => {
    let s = cartReducer(vazio, { type: 'adicionar', unidadeId: 1, item: itemCardapio(), quantidade: 1 })
    s = cartReducer(s, { type: 'alterarQuantidade', produtoId: 1, quantidade: 99 })
    expect(s.itens[0].quantidade).toBe(QUANTIDADE_MAXIMA)
    s = cartReducer(s, { type: 'alterarQuantidade', produtoId: 1, quantidade: 0 })
    expect(s.itens).toHaveLength(0)
    s = cartReducer(s, { type: 'adicionar', unidadeId: 1, item: itemCardapio({ produtoId: 2, nome: 'Cuscuz' }), quantidade: 1 })
    s = cartReducer(s, { type: 'remover', produtoId: 2 })
    expect(s.itens).toHaveLength(0)
  })

  it('CT07c — carrinho pertence a uma única unidade: trocar de unidade reinicia os itens (RN01)', () => {
    const s1 = cartReducer(vazio, { type: 'adicionar', unidadeId: 1, item: itemCardapio(), quantidade: 2 })
    const s2 = cartReducer(s1, { type: 'adicionar', unidadeId: 2, item: itemCardapio({ produtoId: 3, nome: 'Bolo' }), quantidade: 1 })
    expect(s2.unidadeId).toBe(2)
    expect(s2.itens.map((i) => i.produtoId)).toEqual([3])
    expect(cartReducer(s2, { type: 'limpar' })).toEqual(vazio)
  })
})
