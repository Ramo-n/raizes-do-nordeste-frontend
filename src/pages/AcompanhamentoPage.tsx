import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { OrderStatus, StatusChip } from '@/components/pedido/OrderStatus'
import { Alert, Button, ErrorState, LinkButton, LoadingState, Modal } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { paraAppError } from '@/services/errors'
import { useToast } from '@/store/ToastContext'
import { formatarDataHora, formatarMoeda } from '@/utils/format'

const INTERVALO_POLLING_MS = 4000

/** UC09 — Acompanhar Pedido (RF10). Atualiza por polling até PRONTO/ENTREGUE; permite concluir retirada. */
export function AcompanhamentoPage() {
  const { pedidoId } = useParams()
  const id = Number(pedidoId)
  const { notificar } = useToast()
  const pedido = useAsync(() => servicos.pedidos.obter(id), [id], { habilitado: Number.isFinite(id) })
  const [confirmarRetirada, setConfirmarRetirada] = useState(false)
  const [concluindo, setConcluindo] = useState(false)
  const status = pedido.dados?.status

  useEffect(() => {
    if (!status || status === 'PRONTO' || status === 'ENTREGUE' || status === 'CANCELADO' || status === 'PAGAMENTO_RECUSADO' || status === 'AGUARDANDO_PAGAMENTO') return
    const t = window.setInterval(pedido.recarregar, INTERVALO_POLLING_MS)
    return () => window.clearInterval(t)
  }, [status, pedido.recarregar])

  useEffect(() => {
    if (status === 'PRONTO') notificar('Seu pedido está pronto para retirada!', 'sucesso')
  }, [status, notificar])

  const concluirRetirada = async () => {
    setConcluindo(true)
    try {
      await servicos.pedidos.avancarStatus(id)
      setConfirmarRetirada(false)
      notificar('Retirada confirmada. Bom apetite!', 'sucesso')
      pedido.recarregar()
    } catch (e) {
      notificar(paraAppError(e).message, 'erro')
    } finally {
      setConcluindo(false)
    }
  }

  if (pedido.estado === 'loading' || pedido.estado === 'idle') return <LoadingState mensagem="Carregando pedido..." />
  if (pedido.estado === 'error' || !pedido.dados)
    return <ErrorState erro={pedido.erro} titulo="Pedido não encontrado" aoTentarNovamente={pedido.recarregar} acao={<LinkButton to={ROTAS.pedidos}>Meus pedidos</LinkButton>} />

  const p = pedido.dados
  return (
    <div className="container-estreito">
      <div className="pagina__cabecalho">
        <div>
          <h1>Pedido #{p.id}</h1>
          <p className="pagina__subtitulo">{formatarDataHora(p.dataHora)}</p>
        </div>
        <StatusChip status={p.status} />
      </div>

      {p.status === 'PRONTO' && (
        <div className="pagamento-status pagamento-status--APPROVED" role="status">
          <span className="pagamento-status__icone" aria-hidden="true">
            🛎️
          </span>
          <h2 className="pagamento-status__titulo">Pedido pronto!</h2>
          <p>Apresente o código abaixo no balcão.</p>
          <p className="codigo-retirada">{p.codigoRetirada}</p>
          <Button variante="sucesso" tamanho="grande" onClick={() => setConfirmarRetirada(true)}>
            Confirmar retirada
          </Button>
        </div>
      )}

      {p.status === 'ENTREGUE' && (
        <Alert tipo="sucesso" titulo="Pedido retirado">
          Obrigado por pedir na Raízes do Nordeste! {p.pontosGanhos > 0 && `Você ganhou ${p.pontosGanhos} pontos.`}
        </Alert>
      )}

      {(p.status === 'AGUARDANDO_PAGAMENTO' || p.status === 'PAGAMENTO_RECUSADO') && (
        <Alert tipo="alerta" titulo="Pagamento pendente">
          Este pedido ainda não foi pago. <LinkButton to={ROTAS.pagamento(p.id)} variante="primario" tamanho="pequeno">Ir para pagamento</LinkButton>
        </Alert>
      )}

      <section className="card mt-4" aria-labelledby="status-titulo">
        <div className="linha linha--entre">
          <h2 id="status-titulo" className="card__titulo" style={{ margin: 0 }}>
            Status
          </h2>
          <Button variante="fantasma" tamanho="pequeno" onClick={pedido.recarregar}>
            Atualizar
          </Button>
        </div>
        <OrderStatus pedido={p} />
        {(p.status === 'PAGO' || p.status === 'EM_PREPARO') && <p className="texto-pequeno texto-suave">Atualização automática a cada {INTERVALO_POLLING_MS / 1000}s.</p>}
      </section>

      <section className="card mt-4" aria-labelledby="itens-ac">
        <h2 id="itens-ac" className="card__titulo">
          Itens
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
          <li className="linha linha--entre resumo__linha--total">
            <span>Total</span>
            <span>{formatarMoeda(p.valorTotal)}</span>
          </li>
        </ul>
        <p className="texto-pequeno texto-suave">
          Código de retirada: <strong>{p.codigoRetirada}</strong> · em nome de {p.nomeRetirada}
        </p>
      </section>

      <div className="linha mt-4">
        <LinkButton to={ROTAS.pedidos} variante="contorno">
          Meus pedidos
        </LinkButton>
        <LinkButton to={ROTAS.cardapio} variante="fantasma">
          Novo pedido
        </LinkButton>
      </div>

      <Modal
        aberto={confirmarRetirada}
        titulo="Confirmar retirada?"
        aoFechar={() => setConfirmarRetirada(false)}
        acoes={
          <>
            <Button onClick={() => setConfirmarRetirada(false)}>Ainda não</Button>
            <Button variante="sucesso" onClick={concluirRetirada} carregando={concluindo}>
              Sim, retirei
            </Button>
          </>
        }
      >
        <p>Confirme apenas após receber o pedido no balcão. O pedido será marcado como retirado.</p>
      </Modal>
    </div>
  )
}
