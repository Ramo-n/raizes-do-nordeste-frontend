import { Link, Navigate } from 'react-router-dom'
import { StatusChip } from '@/components/pedido/OrderStatus'
import { EmptyState, ErrorState, LinkButton, LoadingState } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { useAuth } from '@/store/AuthContext'
import { formatarDataHora, formatarMoeda } from '@/utils/format'

/** Lista de pedidos do cliente autenticado (RF10). */
export function PedidosPage() {
  const { sessao, autenticado, ehOperacional } = useAuth()
  const clienteId = sessao?.cliente?.id ?? null
  const pedidos = useAsync(() => servicos.pedidos.listar({ clienteId: clienteId as number }), [clienteId], { habilitado: clienteId !== null, estaVazio: (p) => p.length === 0 })

  if (!autenticado) return <Navigate to={ROTAS.login} replace state={{ de: ROTAS.pedidos }} />
  if (ehOperacional) return <Navigate to={ROTAS.painel} replace />

  return (
    <div className="container-estreito">
      <h1>Meus pedidos</h1>
      {pedidos.estado === 'loading' && <LoadingState mensagem="Carregando pedidos..." />}
      {pedidos.estado === 'error' && <ErrorState erro={pedidos.erro} titulo="Não foi possível carregar seus pedidos" aoTentarNovamente={pedidos.recarregar} />}
      {pedidos.estado === 'empty' && <EmptyState titulo="Você ainda não fez pedidos" descricao="Que tal uma tapioca?" icone="🧾" acao={<LinkButton to={ROTAS.cardapio} variante="primario">Ver cardápio</LinkButton>} />}
      {pedidos.estado === 'success' && pedidos.dados && (
        <ul className="pilha" aria-label="Pedidos">
          {pedidos.dados.map((p) => (
            <li key={p.id}>
              <Link to={ROTAS.acompanhamento(p.id)} className="card card--clicavel" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div className="linha linha--entre">
                  <strong>Pedido #{p.id}</strong>
                  <StatusChip status={p.status} />
                </div>
                <p className="texto-pequeno texto-suave" style={{ margin: 'var(--esp-1) 0 0' }}>
                  {formatarDataHora(p.dataHora)} · {p.itens.reduce((s, i) => s + i.quantidade, 0)} itens · {formatarMoeda(p.valorTotal)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
