import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OrderSummary } from '@/components/carrinho/OrderSummary'
import { PaymentStatus } from '@/components/pagamento/PaymentStatus'
import type { EstadoPagamentoUI } from '@/components/pagamento/textosPagamento'
import { Alert, Button, ErrorState, LinkButton, LoadingState } from '@/components/ui'
import { env } from '@/config/env'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { useCart } from '@/store/CartContext'
import { useChannel } from '@/store/ChannelContext'
import type { CenarioSimulacaoPagamento, FormaPagamento, Pagamento } from '@/types'
import { formatarMoeda } from '@/utils/format'

const FORMAS: { valor: FormaPagamento; titulo: string; descricao: string; icone: string }[] = [
  { valor: 'PIX', titulo: 'Pix', descricao: 'Aprovação imediata via provedor externo.', icone: '⚡' },
  { valor: 'CARTAO_CREDITO', titulo: 'Cartão de crédito', descricao: 'Processado pelo provedor; não digitamos dados do cartão aqui.', icone: '💳' },
  { valor: 'CARTAO_DEBITO', titulo: 'Cartão de débito', descricao: 'Processado pelo provedor externo.', icone: '💳' },
  { valor: 'VALE_REFEICAO', titulo: 'Vale-refeição', descricao: 'Bandeiras aceitas pela unidade.', icone: '🍽️' },
]

const CENARIOS: { valor: CenarioSimulacaoPagamento; rotulo: string }[] = [
  { valor: 'APROVADO', rotulo: 'Aprovar' },
  { valor: 'RECUSADO', rotulo: 'Recusar' },
  { valor: 'ERRO', rotulo: 'Erro do serviço' },
  { valor: 'TIMEOUT', rotulo: 'Timeout' },
]

/**
 * UC08 — Realizar Pagamento (RF14, RF15, RF16, RF18).
 * Front-End → PagamentoService → PaymentGateway (MOCK) → retorno → Front-End.
 */
export function PagamentoPage() {
  const { pedidoId } = useParams()
  const id = Number(pedidoId)
  const navigate = useNavigate()
  const { limpar } = useCart()
  const { canal } = useChannel()
  const [forma, setForma] = useState<FormaPagamento>('PIX')
  const [cenario, setCenario] = useState<CenarioSimulacaoPagamento | undefined>(env.dataSource === 'mock' ? 'APROVADO' : undefined)
  const [estado, setEstado] = useState<EstadoPagamentoUI>('IDLE')
  const [ultimo, setUltimo] = useState<Pagamento | null>(null)
  const [erroForma, setErroForma] = useState<string | null>(null)
  const redirecionamento = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(redirecionamento.current), [])

  const pedido = useAsync(() => servicos.pedidos.obter(id), [id], { habilitado: Number.isFinite(id) })
  const historico = useAsync(() => servicos.pagamentos.historico(id), [id, ultimo?.id], { habilitado: Number.isFinite(id) })

  // Pedido já pago: segue para a confirmação.
  useEffect(() => {
    const st = pedido.dados?.status
    if (st && st !== 'AGUARDANDO_PAGAMENTO' && st !== 'PAGAMENTO_RECUSADO' && st !== 'CRIADO') navigate(ROTAS.confirmacao(id), { replace: true })
  }, [pedido.dados?.status, id, navigate])

  const pagar = async () => {
    if (!pedido.dados) return
    if (!forma) {
      setErroForma('Selecione uma forma de pagamento.')
      return
    }
    setErroForma(null)
    setEstado('REQUESTED')
    const resultado = await servicos.pagamentos.pagar({ pedidoId: id, valor: pedido.dados.valorTotal, forma, cenario }, (e) => setEstado(e))
    setUltimo(resultado)
    if (resultado.status === 'APPROVED') {
      limpar()
      redirecionamento.current = window.setTimeout(() => navigate(ROTAS.confirmacao(id), { replace: true }), 1600)
    } else {
      pedido.recarregar()
    }
  }

  if (pedido.estado === 'loading' || pedido.estado === 'idle') return <LoadingState mensagem="Carregando pedido..." />
  if (pedido.estado === 'error' || !pedido.dados)
    return <ErrorState erro={pedido.erro} titulo="Pedido não encontrado" aoTentarNovamente={pedido.recarregar} acao={<LinkButton to={ROTAS.carrinho}>Voltar ao carrinho</LinkButton>} />

  const p = pedido.dados
  const processando = estado === 'REQUESTED' || estado === 'PENDING'
  const tentativas = historico.dados?.length ?? 0

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1>Pagamento</h1>
          <p className="pagina__subtitulo">
            Pedido #{p.id} · {formatarMoeda(p.valorTotal)}
          </p>
        </div>
      </div>

      <div className="grade grade--2-lg">
        <div className="pilha">
          {estado === 'IDLE' ? (
            <>
              {p.status === 'PAGAMENTO_RECUSADO' && (
                <Alert tipo="erro" titulo="Pagamento recusado anteriormente">
                  Sua última tentativa não foi autorizada. Escolha uma forma de pagamento e tente novamente — nenhuma cobrança foi realizada.
                </Alert>
              )}
              <section className="card" aria-labelledby="forma-pg">
                <h2 id="forma-pg" className="card__titulo">
                  Forma de pagamento
                </h2>
                <Alert tipo="info">
                  🔒 O pagamento é processado por um <strong>serviço externo</strong>. Não pedimos nem armazenamos número de cartão, CPF ou dados bancários. Nesta versão acadêmica o
                  provedor é <strong>simulado</strong> — nenhum valor real é cobrado.
                </Alert>
                <div className="opcoes-radio mt-4" role="radiogroup" aria-labelledby="forma-pg">
                  {FORMAS.map((f) => (
                    <label key={f.valor} className="opcao-radio">
                      <input type="radio" name="forma" value={f.valor} checked={forma === f.valor} onChange={() => setForma(f.valor)} />
                      <span className="opcao-radio__texto">
                        <strong>
                          <span aria-hidden="true">{f.icone}</span> {f.titulo}
                        </strong>
                        <span className="opcao-radio__desc">{f.descricao}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {erroForma && (
                  <p className="campo__erro" role="alert">
                    {erroForma}
                  </p>
                )}
              </section>

              {env.dataSource === 'mock' && canal !== 'TOTEM' && (
                <section className="simulacao" aria-labelledby="sim-titulo">
                  <h3 id="sim-titulo" style={{ margin: 0 }}>
                    🧪 Simulação do gateway (ambiente acadêmico)
                  </h3>
                  <p className="texto-pequeno texto-suave">Escolha o resultado que o provedor externo MOCK deve devolver para demonstrar cada fluxo.</p>
                  <div className="linha" role="radiogroup" aria-label="Cenário simulado">
                    {CENARIOS.map((c) => (
                      <label key={c.valor} className="chip" style={{ cursor: 'pointer' }}>
                        <input type="radio" name="cenario" value={c.valor} checked={cenario === c.valor} onChange={() => setCenario(c.valor)} style={{ marginRight: 6 }} />
                        {c.rotulo}
                      </label>
                    ))}
                  </div>
                </section>
              )}

              <Button variante="primario" tamanho="grande" bloco onClick={pagar}>
                Pagar {formatarMoeda(p.valorTotal)}
              </Button>
            </>
          ) : (
            <PaymentStatus
              estado={estado}
              mensagem={processando ? null : ultimo?.mensagem}
              referencia={ultimo?.referenciaExterna}
              tentativa={ultimo?.tentativa}
              acoes={
                estado === 'APPROVED' ? (
                  <LinkButton to={ROTAS.confirmacao(id)} variante="sucesso" tamanho="grande">
                    Ver confirmação do pedido
                  </LinkButton>
                ) : estado === 'DECLINED' || estado === 'ERROR' ? (
                  <>
                    <Button variante="primario" tamanho="grande" onClick={() => setEstado('IDLE')}>
                      Tentar novamente
                    </Button>
                    <LinkButton to={ROTAS.carrinho} variante="fantasma">
                      Voltar ao carrinho
                    </LinkButton>
                  </>
                ) : null
              }
            />
          )}

          {tentativas > 0 && !processando && (
            <details className="card">
              <summary>Histórico de tentativas ({tentativas})</summary>
              <ul className="lista-detalhes texto-pequeno mt-4">
                {historico.dados?.map((h) => (
                  <li key={h.id} className="linha linha--entre">
                    <span>
                      #{h.tentativa} · {h.forma} · {h.status}
                    </span>
                    <span className="texto-suave">{h.mensagem}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <aside className="card" aria-labelledby="resumo-pg">
          <h2 id="resumo-pg" className="card__titulo">
            Resumo do pedido
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
          <p className="texto-pequeno texto-suave mt-4">
            Retirada: {p.nomeRetirada} · <Link to={ROTAS.privacidade}>Privacidade</Link>
          </p>
        </aside>
      </div>
    </div>
  )
}
