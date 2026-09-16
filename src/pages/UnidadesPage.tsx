import { useNavigate } from 'react-router-dom'
import { UnitSelector } from '@/components/unidade/UnitSelector'
import { Alert, EmptyState, ErrorState, LoadingState } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'
import { useUnit } from '@/store/UnitContext'
import type { Unidade } from '@/types'

/** UC03 — Selecionar Unidade (RF03). */
export function UnidadesPage() {
  const { unidade, selecionar } = useUnit()
  const { unidadeId: unidadeCarrinho, vazio, limpar } = useCart()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const { estado, dados, erro, recarregar } = useAsync(() => servicos.unidades.listar(), [], { estaVazio: (u) => u.length === 0 })

  const aoSelecionar = (u: Unidade) => {
    if (!vazio && unidadeCarrinho !== null && unidadeCarrinho !== u.id) {
      limpar()
      notificar('Carrinho esvaziado: cada pedido pertence a uma única unidade.', 'alerta')
    }
    selecionar(u)
    notificar(`Unidade ${u.nome} selecionada.`, 'sucesso')
    navigate(ROTAS.cardapio)
  }

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1>Escolha sua unidade</h1>
          <p className="pagina__subtitulo">O cardápio, os preços e as promoções variam por unidade.</p>
        </div>
      </div>

      {!vazio && <Alert tipo="info">Você já tem itens no carrinho. Ao trocar de unidade, o carrinho será esvaziado.</Alert>}

      <div className="mt-4">
        {estado === 'loading' && <LoadingState mensagem="Buscando unidades..." />}
        {estado === 'error' && <ErrorState erro={erro} titulo="Não foi possível carregar as unidades" aoTentarNovamente={recarregar} />}
        {estado === 'empty' && <EmptyState titulo="Nenhuma unidade disponível" descricao="Tente novamente mais tarde." icone="📍" />}
        {estado === 'success' && dados && <UnitSelector unidades={dados} selecionadaId={unidade?.id ?? null} aoSelecionar={aoSelecionar} />}
      </div>
    </div>
  )
}
