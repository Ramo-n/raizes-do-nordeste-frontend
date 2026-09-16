import { Navigate, useParams } from 'react-router-dom'
import { OrderSummary } from '@/components/carrinho/OrderSummary'
import { Alert, ErrorState, LinkButton, LoadingState } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { useAuth } from '@/store/AuthContext'
import { formatarDataHora, formatarMoeda } from '@/utils/format'

const ROTULO_RETIRADA = { BALCAO: 'Retirar no balcão', MESA: 'Comer na loja', RETIRADA_RAPIDA: 'Retirada rápida' }

/** RF16 — Confirmação do pedido (após APPROVED). */
export function ConfirmacaoPage() {
  const { pedidoId } = useParams()
  const id = Number(pedidoId)
  const { sessao } = useAuth()
  const pedido = useAsync(() => servicos.pedidos.obter(id), [id], { habilitado: Number.isFinite(id) })

  if (pedido.estado === 'loading' || pedido.estado === 'idle') return <LoadingState mensagem="Carregando confirmação..." />
  if (pedido.estado === 'error' || !pedido.dados) return <ErrorState erro={pedido.erro} titulo="Pedido não encontrado" aoTentarNovamente={pedido.recarregar} acao={<LinkButton to={ROTAS.inicio}>Início</LinkButton>} />

  const p = pedido.dados
  if (p.status === 'AGUARDANDO_PAGAMENTO' || p.status === 'PAGAMENTO_RECUSADO' || p.status === 'CRIADO') return <Navigate to={ROTAS.pagamento(id)} replace />

  return (
    <div className="container-estreito texto-centro">
      <div className="pagamento-status pagamento-status--APPROVED" role="status">
        <span className="pagamento-status__icone" aria-hidden="true">
          ✅
        </span>
        <h1 className="pagamento-status__titulo">Pedido confirmado!</h1>
        <p className="texto-suave">Pagamento aprovado. Seu pedido foi enviado para a cozinha de {ROTULO_RETIRADA[p.formaRetirada].toLowerCase()}.</p>
        <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
          Código de retirada
        </p>
        <p className="codigo-retirada" aria-label={`Código de retirada ${p.codigoRetirada}`}>
          {p.codigoRetirada}
        </p>
        <p className="texto-pequeno">
          Pedido #{p.id} · {formatarDataHora(p.dataHora)} · em nome de <strong>{p.nomeRetirada}</strong>
        </p>
      </div>

      {p.pontosGanhos > 0 && (
        <Alert tipo="sucesso">
          ⭐ Você ganhou <strong>{p.pontosGanhos} pontos</strong> de fidelidade com este pedido.
        </Alert>
      )}
      {sessao?.cliente && !sessao.cliente.consentimentoLgpd && (
        <Alert tipo="info">
          Este pedido não gerou pontos porque você ainda não ativou o programa de fidelidade. <LinkButton to={ROTAS.fidelidade} variante="fantasma" tamanho="pequeno">Saiba mais</LinkButton>
        </Alert>
      )}

      <section className="card mt-4" style={{ textAlign: 'left' }} aria-labelledby="conf-resumo">
        <h2 id="conf-resumo" className="card__titulo">
          Resumo
        </h2>
        <ul className="lista-detalhes texto-pequeno">
          {p.itens.map((i) => (
            <li key={i.produtoId} className="linha linha--entre">
              <span>
                {i.quantidade}× {i.nomeProduto}
              </span>
              <span>{formatarMoeda(i.precoUnitario * i.quantidade)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <OrderSummary subtotal={p.valorBruto} descontoFidelidade={p.descontoFidelidade} descontoPromocao={p.descontoPromocao} rotuloPromocao={p.codigoPromocao} total={p.valorTotal} />
        </div>
      </section>

      <div className="pilha mt-4">
        <LinkButton to={ROTAS.acompanhamento(p.id)} variante="primario" tamanho="grande" bloco>
          Acompanhar pedido
        </LinkButton>
        <LinkButton to={ROTAS.cardapio} variante="fantasma" bloco>
          Fazer outro pedido
        </LinkButton>
      </div>
    </div>
  )
}
