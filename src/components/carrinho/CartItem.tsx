import { Button, QuantitySelector } from '@/components/ui'
import type { ItemCarrinho } from '@/types'
import { formatarMoeda } from '@/utils/format'

interface CartItemProps {
  item: ItemCarrinho
  aoAlterarQuantidade: (produtoId: number, quantidade: number) => void
  aoRemover: (produtoId: number) => void
}

/** Linha do carrinho com alteração de quantidade (RF08) e remoção (RF07). */
export function CartItem({ item, aoAlterarQuantidade, aoRemover }: CartItemProps) {
  return (
    <li className="item-carrinho" aria-label={`${item.nome}, ${item.quantidade} unidades`}>
      <div className="item-carrinho__imagem" aria-hidden="true">
        {item.imagem}
      </div>
      <div>
        <div className="linha linha--entre">
          <strong>{item.nome}</strong>
          <span>{formatarMoeda(item.precoUnitario * item.quantidade)}</span>
        </div>
        <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
          {formatarMoeda(item.precoUnitario)} cada
        </p>
        <div className="item-carrinho__acoes">
          <QuantitySelector valor={item.quantidade} aoAlterar={(q) => aoAlterarQuantidade(item.produtoId, q)} rotulo={`Quantidade de ${item.nome}`} />
          <Button variante="fantasma" tamanho="pequeno" onClick={() => aoRemover(item.produtoId)} aria-label={`Remover ${item.nome} do carrinho`}>
            🗑 Remover
          </Button>
        </div>
      </div>
    </li>
  )
}
