import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ProductDetails } from '@/components/cardapio/ProductDetails'
import { ErrorState, LinkButton, LoadingState } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'
import { useUnit } from '@/store/UnitContext'
import type { ItemCardapio } from '@/types'

/** RF05 — Detalhes do produto. */
export function ProdutoPage() {
  const { produtoId } = useParams()
  const { unidade } = useUnit()
  const { adicionar } = useCart()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const id = Number(produtoId)
  const unidadeId = unidade?.id ?? null

  const { estado, dados, erro, recarregar } = useAsync(() => servicos.cardapio.obterItem(unidadeId as number, id), [unidadeId, id], {
    habilitado: unidadeId !== null && Number.isFinite(id),
  })

  if (!unidade) return <Navigate to={ROTAS.unidades} replace />

  const aoAdicionar = (item: ItemCardapio, quantidade: number) => {
    adicionar(unidade.id, item, quantidade)
    notificar(`${quantidade}× ${item.nome} adicionado ao carrinho.`, 'sucesso')
    navigate(ROTAS.carrinho)
  }

  if (estado === 'loading' || estado === 'idle') return <LoadingState mensagem="Carregando produto..." />
  if (estado === 'error' || !dados)
    return <ErrorState erro={erro} titulo="Produto não encontrado" aoTentarNovamente={recarregar} acao={<LinkButton to={ROTAS.cardapio}>Voltar ao cardápio</LinkButton>} />

  return <ProductDetails item={dados} aoAdicionar={aoAdicionar} aoVoltar={() => navigate(ROTAS.cardapio)} />
}
