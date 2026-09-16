import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/config/env'
import type { ItemCardapio, ItemCarrinho } from '@/types'
import { storage } from '@/utils/storage'

export const QUANTIDADE_MAXIMA = 20

interface CartState {
  unidadeId: number | null
  itens: ItemCarrinho[]
}

type CartAction =
  | { type: 'adicionar'; unidadeId: number; item: ItemCardapio; quantidade: number }
  | { type: 'remover'; produtoId: number }
  | { type: 'alterarQuantidade'; produtoId: number; quantidade: number }
  | { type: 'limpar' }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'adicionar': {
      // Carrinho pertence a uma única unidade (RN01); trocar de unidade reinicia o carrinho.
      const base = state.unidadeId === action.unidadeId ? state.itens : []
      const existente = base.find((i) => i.produtoId === action.item.produtoId)
      const itens = existente
        ? base.map((i) =>
            i.produtoId === action.item.produtoId ? { ...i, quantidade: Math.min(QUANTIDADE_MAXIMA, i.quantidade + action.quantidade) } : i,
          )
        : [
            ...base,
            {
              produtoId: action.item.produtoId,
              nome: action.item.nome,
              precoUnitario: action.item.preco,
              quantidade: Math.min(QUANTIDADE_MAXIMA, action.quantidade),
              imagem: action.item.imagem,
              categoria: action.item.categoria,
            },
          ]
      return { unidadeId: action.unidadeId, itens }
    }
    case 'remover':
      return { ...state, itens: state.itens.filter((i) => i.produtoId !== action.produtoId) }
    case 'alterarQuantidade': {
      if (action.quantidade <= 0) return { ...state, itens: state.itens.filter((i) => i.produtoId !== action.produtoId) }
      return {
        ...state,
        itens: state.itens.map((i) => (i.produtoId === action.produtoId ? { ...i, quantidade: Math.min(QUANTIDADE_MAXIMA, action.quantidade) } : i)),
      }
    }
    case 'limpar':
      return { unidadeId: null, itens: [] }
  }
}

interface CartContextValue extends CartState {
  totalItens: number
  subtotal: number
  vazio: boolean
  adicionar: (unidadeId: number, item: ItemCardapio, quantidade?: number) => void
  remover: (produtoId: number) => void
  alterarQuantidade: (produtoId: number, quantidade: number) => void
  limpar: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const ESTADO_INICIAL: CartState = { unidadeId: null, itens: [] }

function persistir(state: CartState) {
  storage.set(STORAGE_KEYS.carrinho, state)
  return state
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    (s: CartState, a: CartAction) => persistir(cartReducer(s, a)),
    undefined,
    () => storage.get<CartState>(STORAGE_KEYS.carrinho, ESTADO_INICIAL),
  )

  const adicionar = useCallback((unidadeId: number, item: ItemCardapio, quantidade = 1) => dispatch({ type: 'adicionar', unidadeId, item, quantidade }), [])
  const remover = useCallback((produtoId: number) => dispatch({ type: 'remover', produtoId }), [])
  const alterarQuantidade = useCallback((produtoId: number, quantidade: number) => dispatch({ type: 'alterarQuantidade', produtoId, quantidade }), [])
  const limpar = useCallback(() => dispatch({ type: 'limpar' }), [])

  const value = useMemo<CartContextValue>(() => {
    const totalItens = state.itens.reduce((acc, i) => acc + i.quantidade, 0)
    const subtotal = Math.round(state.itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0) * 100) / 100
    return { ...state, totalItens, subtotal, vazio: state.itens.length === 0, adicionar, remover, alterarQuantidade, limpar }
  }, [state, adicionar, remover, alterarQuantidade, limpar])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>')
  return ctx
}
