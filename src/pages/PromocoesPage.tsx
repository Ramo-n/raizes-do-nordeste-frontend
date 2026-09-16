import { useNavigate } from 'react-router-dom'
import { PromotionCard } from '@/components/promocoes/PromotionCard'
import { Alert, EmptyState, ErrorState, LoadingState } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'
import { useUnit } from '@/store/UnitContext'

/** RF13 — Promoções e campanhas (por unidade quando houver unidade selecionada). */
export function PromocoesPage() {
  const { unidade } = useUnit()
  const { vazio } = useCart()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const promos = useAsync(() => servicos.promocoes.listar(unidade?.id), [unidade?.id], { estaVazio: (p) => p.length === 0 })

  const copiar = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo)
      notificar(`Código ${codigo} copiado.`, 'sucesso')
    } catch {
      notificar(`Código: ${codigo}`, 'info')
    }
  }

  const usar = (codigo: string) => {
    if (vazio) {
      notificar('Adicione produtos ao carrinho para usar a promoção.', 'info')
      navigate(unidade ? ROTAS.cardapio : ROTAS.unidades, { state: { codigoPromocao: codigo } })
      return
    }
    navigate(ROTAS.checkout, { state: { codigoPromocao: codigo } })
  }

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1>Promoções</h1>
          <p className="pagina__subtitulo">{unidade ? `Válidas em ${unidade.nome}` : 'Escolha uma unidade para ver promoções específicas.'}</p>
        </div>
      </div>
      <Alert tipo="info">Promoções e desconto de fidelidade são cumulativos, limitados ao valor do pedido. O código é aplicado na etapa de revisão do pedido.</Alert>
      <div className="mt-4">
        {promos.estado === 'loading' && <LoadingState mensagem="Carregando promoções..." />}
        {promos.estado === 'error' && <ErrorState erro={promos.erro} titulo="Não foi possível carregar as promoções" aoTentarNovamente={promos.recarregar} />}
        {promos.estado === 'empty' && <EmptyState titulo="Nenhuma promoção no momento" descricao="Volte em breve — novas campanhas sazonais são publicadas com frequência." icone="🏷️" />}
        {promos.estado === 'success' && promos.dados && (
          <div className="grade grade--2">
            {promos.dados.map((p) => (
              <PromotionCard key={p.id} promocao={p} aoCopiar={copiar} aoUsar={usar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
