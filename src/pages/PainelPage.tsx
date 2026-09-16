import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { StatusChip } from '@/components/pedido/OrderStatus'
import { ROTULO_STATUS } from '@/components/pedido/pedidoStatus'
import { Alert, Button, EmptyState, ErrorState, LoadingState } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { paraAppError } from '@/services/errors'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'
import type { Pedido, StatusPedido, Unidade } from '@/types'
import { formatarHora, formatarMoeda } from '@/utils/format'

const PROXIMO: Partial<Record<StatusPedido, { acao: string; destino: StatusPedido }>> = {
  PAGO: { acao: 'Iniciar preparo', destino: 'EM_PREPARO' },
  EM_PREPARO: { acao: 'Marcar como pronto', destino: 'PRONTO' },
  PRONTO: { acao: 'Confirmar entrega', destino: 'ENTREGUE' },
}

const FILA: StatusPedido[] = ['PAGO', 'EM_PREPARO', 'PRONTO']

/** UC10 — Atualizar Status do Pedido (atores Atendente/Cozinha). Painel operacional simplificado. */
export function PainelPage() {
  const { autenticado, ehOperacional, sessao } = useAuth()
  const { notificar } = useToast()
  const [unidadeId, setUnidadeId] = useState<number | null>(null)
  const [avancando, setAvancando] = useState<number | null>(null)

  const unidades = useAsync(() => servicos.unidades.listar(), [])
  const pedidos = useAsync(() => servicos.pedidos.listar(unidadeId != null ? { unidadeId } : undefined), [unidadeId], { estaVazio: (p) => p.length === 0, habilitado: autenticado && ehOperacional })

  useEffect(() => {
    const t = window.setInterval(pedidos.recarregar, 6000)
    return () => window.clearInterval(t)
  }, [pedidos.recarregar])

  if (!autenticado) return <Navigate to={ROTAS.login} replace state={{ de: ROTAS.painel }} />
  if (!ehOperacional) {
    return (
      <div className="container-estreito">
        <Alert tipo="alerta" titulo="Acesso restrito">
          O painel operacional é exclusivo para perfis Atendente, Gerente e Matriz. Sua conta é de cliente.
        </Alert>
      </div>
    )
  }

  const avancar = async (p: Pedido) => {
    setAvancando(p.id)
    try {
      const atualizado = await servicos.pedidos.avancarStatus(p.id)
      notificar(`Pedido #${p.id} → ${ROTULO_STATUS[atualizado.status]}.`, 'sucesso')
      pedidos.recarregar()
    } catch (e) {
      notificar(paraAppError(e).message, 'erro')
    } finally {
      setAvancando(null)
    }
  }

  const emFila = (pedidos.dados ?? []).filter((p) => FILA.includes(p.status))
  const outros = (pedidos.dados ?? []).filter((p) => !FILA.includes(p.status))

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1>Painel operacional</h1>
          <p className="pagina__subtitulo">
            {sessao?.role} · {sessao?.email}
          </p>
        </div>
        <div className="campo" style={{ minWidth: 220 }}>
          <label className="campo__label" htmlFor="filtro-unidade">
            Unidade
          </label>
          <select id="filtro-unidade" className="campo__select" value={unidadeId ?? ''} onChange={(e) => setUnidadeId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">Todas</option>
            {(unidades.dados ?? []).map((u: Unidade) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pedidos.estado === 'loading' && <LoadingState mensagem="Carregando fila de pedidos..." />}
      {pedidos.estado === 'error' && <ErrorState erro={pedidos.erro} titulo="Não foi possível carregar os pedidos" aoTentarNovamente={pedidos.recarregar} />}
      {pedidos.estado === 'empty' && <EmptyState titulo="Nenhum pedido" descricao="Ainda não há pedidos para esta unidade." icone="🧑‍🍳" />}

      {pedidos.estado === 'success' && (
        <>
          <section aria-labelledby="fila-titulo">
            <h2 id="fila-titulo">Fila da cozinha ({emFila.length})</h2>
            {emFila.length === 0 ? (
              <p className="texto-suave">Nenhum pedido pago aguardando preparo.</p>
            ) : (
              <ul className="grade grade--2 grade--3" aria-label="Pedidos em andamento">
                {emFila.map((p) => {
                  const prox = PROXIMO[p.status]
                  return (
                    <li key={p.id} className="card">
                      <div className="linha linha--entre">
                        <strong>
                          #{p.id} · {p.codigoRetirada}
                        </strong>
                        <StatusChip status={p.status} />
                      </div>
                      <p className="texto-pequeno texto-suave" style={{ margin: 'var(--esp-1) 0' }}>
                        {formatarHora(p.dataHora)} · {p.canalPedido} · {p.nomeRetirada} · {formatarMoeda(p.valorTotal)}
                      </p>
                      <ul className="texto-pequeno" style={{ paddingLeft: 'var(--esp-4)' }}>
                        {p.itens.map((i) => (
                          <li key={i.produtoId}>
                            {i.quantidade}× {i.nomeProduto}
                          </li>
                        ))}
                      </ul>
                      {prox && (
                        <Button variante="primario" bloco onClick={() => avancar(p)} carregando={avancando === p.id}>
                          {prox.acao}
                        </Button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {outros.length > 0 && (
            <section className="mt-4" aria-labelledby="outros-titulo">
              <h2 id="outros-titulo">Outros pedidos ({outros.length})</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Hora</th>
                      <th>Canal</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outros.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>{formatarHora(p.dataHora)}</td>
                        <td>{p.canalPedido}</td>
                        <td>{formatarMoeda(p.valorTotal)}</td>
                        <td><StatusChip status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
