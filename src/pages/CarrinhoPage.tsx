import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartItem } from '@/components/carrinho/CartItem'
import { OrderSummary } from '@/components/carrinho/OrderSummary'
import { Alert, Button, EmptyState, LinkButton, Modal } from '@/components/ui'
import { ROTAS } from '@/routes/paths'
import { useAuth } from '@/store/AuthContext'
import { useCart } from '@/store/CartContext'
import { useChannel } from '@/store/ChannelContext'
import { useToast } from '@/store/ToastContext'
import { useUnit } from '@/store/UnitContext'

/** UC06 — Gerenciar Carrinho (RF06–RF08); bloqueia finalização com carrinho vazio. */
export function CarrinhoPage() {
  const { itens, subtotal, vazio, totalItens, alterarQuantidade, remover, limpar } = useCart()
  const { unidade } = useUnit()
  const { autenticado } = useAuth()
  const { canal } = useChannel()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const [confirmarLimpar, setConfirmarLimpar] = useState(false)

  const finalizar = () => {
    if (vazio) {
      notificar('Seu carrinho está vazio. Adicione produtos antes de finalizar.', 'erro')
      return
    }
    if (!autenticado && canal !== 'TOTEM') {
      notificar('Entre ou cadastre-se para finalizar o pedido.', 'info')
      navigate(ROTAS.login, { state: { de: ROTAS.checkout } })
      return
    }
    navigate(ROTAS.checkout)
  }

  const aoRemover = (produtoId: number) => {
    const item = itens.find((i) => i.produtoId === produtoId)
    remover(produtoId)
    if (item) notificar(`${item.nome} removido do carrinho.`, 'info')
  }

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1>Carrinho</h1>
          {unidade && <p className="pagina__subtitulo">Retirada em {unidade.nome}</p>}
        </div>
        {!vazio && (
          <Button variante="fantasma" tamanho="pequeno" onClick={() => setConfirmarLimpar(true)}>
            Esvaziar carrinho
          </Button>
        )}
      </div>

      {vazio ? (
        <EmptyState
          titulo="Seu carrinho está vazio"
          descricao="Escolha produtos no cardápio para montar seu pedido. Não é possível finalizar um pedido sem itens."
          icone="🛒"
          acao={<LinkButton to={unidade ? ROTAS.cardapio : ROTAS.unidades} variante="primario">Ir para o cardápio</LinkButton>}
        />
      ) : (
        <div className="grade grade--2-lg">
          <section aria-labelledby="itens-titulo" className="card">
            <h2 id="itens-titulo" className="card__titulo">
              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </h2>
            <ul>
              {itens.map((item) => (
                <CartItem key={item.produtoId} item={item} aoAlterarQuantidade={alterarQuantidade} aoRemover={aoRemover} />
              ))}
            </ul>
            <div className="mt-4">
              <LinkButton to={ROTAS.cardapio} variante="contorno" bloco>
                + Continuar comprando
              </LinkButton>
            </div>
          </section>

          <aside className="card barra-fixa" aria-labelledby="resumo-titulo">
            <h2 id="resumo-titulo" className="card__titulo">
              Resumo
            </h2>
            <OrderSummary subtotal={subtotal} total={subtotal} />
            <p className="texto-pequeno texto-suave mt-4">Descontos de fidelidade e promoções são aplicados na próxima etapa.</p>
            {!autenticado && canal !== 'TOTEM' && <Alert tipo="info">Para finalizar, você precisará entrar ou criar uma conta rápida.</Alert>}
            <div className="mt-4">
              <Button variante="primario" tamanho="grande" bloco onClick={finalizar}>
                Finalizar pedido
              </Button>
            </div>
          </aside>
        </div>
      )}

      <Modal
        aberto={confirmarLimpar}
        titulo="Esvaziar carrinho?"
        aoFechar={() => setConfirmarLimpar(false)}
        acoes={
          <>
            <Button onClick={() => setConfirmarLimpar(false)}>Cancelar</Button>
            <Button
              variante="perigo"
              onClick={() => {
                limpar()
                setConfirmarLimpar(false)
                notificar('Carrinho esvaziado.', 'info')
              }}
            >
              Esvaziar
            </Button>
          </>
        }
      >
        <p>Todos os itens serão removidos. Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}
