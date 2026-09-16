import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { OrderSummary } from '@/components/carrinho/OrderSummary'
import { Alert, Button, FormField } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import type { ResultadoValidacaoPromocao } from '@/services/contracts'
import { ErroValidacao, paraAppError } from '@/services/errors'
import { useAuth } from '@/store/AuthContext'
import { useCart } from '@/store/CartContext'
import { useChannel } from '@/store/ChannelContext'
import { useToast } from '@/store/ToastContext'
import { useUnit } from '@/store/UnitContext'
import type { FormaRetirada } from '@/types'
import { arredondar, formatarMoeda } from '@/utils/format'

const FORMAS_RETIRADA: { valor: FormaRetirada; titulo: string; descricao: string }[] = [
  { valor: 'BALCAO', titulo: 'Retirar no balcão', descricao: 'Chamamos seu nome quando o pedido estiver pronto.' },
  { valor: 'RETIRADA_RAPIDA', titulo: 'Retirada rápida', descricao: 'Pegue direto na prateleira com o código do pedido.' },
  { valor: 'MESA', titulo: 'Comer na loja', descricao: 'Levamos até a mesa indicada no código.' },
]

/**
 * UC05 — Realizar Pedido (RF09) + UC07 — Aplicar benefício (RF12/RF13).
 * Revisão → promoção/fidelidade → forma de retirada → confirmar (cria pedido AGUARDANDO_PAGAMENTO).
 */
export function CheckoutPage() {
  const { itens, subtotal, vazio, unidadeId } = useCart()
  const { unidade } = useUnit()
  const { sessao, autenticado } = useAuth()
  const { canal, canalPedido } = useChannel()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const codigoInicial = (location.state as { codigoPromocao?: string } | null)?.codigoPromocao ?? ''

  const cliente = sessao?.cliente ?? null
  const totem = canal === 'TOTEM'
  const [formaRetirada, setFormaRetirada] = useState<FormaRetirada>('BALCAO')
  const [nomeRetirada, setNomeRetirada] = useState('')
  const [codigo, setCodigo] = useState(codigoInicial)
  const [promo, setPromo] = useState<ResultadoValidacaoPromocao | null>(null)
  const [validandoPromo, setValidandoPromo] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const fid = useAsync(() => servicos.fidelidade.consultar(cliente?.id as number), [cliente?.id, cliente?.consentimentoLgpd], {
    habilitado: !!cliente?.consentimentoLgpd,
  })
  const percentualFid = fid.dados?.percentualDesconto ?? 0
  const descontoFidelidade = arredondar((subtotal * percentualFid) / 100)
  const descontoPromocao = promo?.valida ? promo.desconto : 0
  const total = arredondar(Math.max(0, subtotal - Math.min(subtotal, descontoFidelidade + descontoPromocao)))

  const validarPromocao = async (cod: string) => {
    if (!unidade) return
    if (!cod.trim()) {
      setPromo(null)
      return
    }
    setValidandoPromo(true)
    try {
      const r = await servicos.promocoes.validar(cod, { unidadeId: unidade.id, canal: canalPedido, subtotal })
      setPromo(r)
      notificar(r.valida ? `Promoção ${r.promocao?.codigo} aplicada: -${formatarMoeda(r.desconto)}.` : (r.motivo ?? 'Promoção inválida.'), r.valida ? 'sucesso' : 'erro')
    } catch (e) {
      setPromo({ valida: false, promocao: null, desconto: 0, motivo: paraAppError(e).message })
    } finally {
      setValidandoPromo(false)
    }
  }

  useEffect(() => {
    if (codigoInicial && unidade && subtotal > 0) void validarPromocao(codigoInicial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (vazio) return <Navigate to={ROTAS.carrinho} replace />
  if (!unidade || unidadeId !== unidade.id) return <Navigate to={ROTAS.unidades} replace />
  if (!autenticado && !totem) return <Navigate to={ROTAS.login} replace state={{ de: ROTAS.checkout }} />

  const confirmar = async (e: FormEvent) => {
    e.preventDefault()
    setErroGeral(null)
    const novosErros: Record<string, string> = {}
    if (!cliente && !nomeRetirada.trim()) novosErros.nomeRetirada = 'Informe um nome para chamarmos você na retirada.'
    if (promo && !promo.valida) novosErros.codigo = promo.motivo ?? 'Promoção inválida. Remova o código ou corrija-o.'
    setErros(novosErros)
    if (Object.keys(novosErros).length) return

    setEnviando(true)
    try {
      const pedido = await servicos.pedidos.criar({
        unidadeId: unidade.id,
        clienteId: cliente?.id ?? null,
        canalPedido,
        itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        formaRetirada,
        nomeRetirada: cliente ? undefined : nomeRetirada.trim(),
        codigoPromocao: promo?.valida ? promo.promocao?.codigo : null,
      })
      notificar(`Pedido #${pedido.id} criado. Agora escolha a forma de pagamento.`, 'sucesso')
      navigate(ROTAS.pagamento(pedido.id), { replace: true })
    } catch (err) {
      const app = paraAppError(err)
      if (app instanceof ErroValidacao && app.detalhes) setErros(app.detalhes)
      setErroGeral(app.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={confirmar} noValidate aria-busy={enviando}>
      <div className="pagina__cabecalho">
        <div>
          <h1>Revisão do pedido</h1>
          <p className="pagina__subtitulo">Retirada em {unidade.nome}</p>
        </div>
      </div>

      {erroGeral && (
        <Alert tipo="erro" titulo="Não foi possível confirmar o pedido">
          {erroGeral}
        </Alert>
      )}

      <div className="grade grade--2-lg">
        <div className="pilha">
          <section className="card" aria-labelledby="itens-rev">
            <h2 id="itens-rev" className="card__titulo">
              Itens
            </h2>
            <ul className="lista-detalhes">
              {itens.map((i) => (
                <li key={i.produtoId} className="linha linha--entre">
                  <span>
                    {i.quantidade}× {i.nome}
                  </span>
                  <span>{formatarMoeda(i.precoUnitario * i.quantidade)}</span>
                </li>
              ))}
            </ul>
            <Link to={ROTAS.carrinho} className="texto-pequeno">
              Editar itens
            </Link>
          </section>

          <section className="card" aria-labelledby="benef">
            <h2 id="benef" className="card__titulo">
              Benefícios
            </h2>
            {cliente?.consentimentoLgpd ? (
              fid.estado === 'loading' ? (
                <p className="texto-suave">Consultando fidelidade...</p>
              ) : percentualFid > 0 ? (
                <Alert tipo="sucesso">
                  ⭐ Nível {fid.dados?.nivel}: {percentualFid}% de desconto de fidelidade aplicado automaticamente.
                </Alert>
              ) : (
                <p className="texto-suave">Você tem {fid.dados?.pontos ?? 0} pontos. A partir de 100 pontos você ganha 5% de desconto.</p>
              )
            ) : cliente ? (
              <Alert tipo="info">
                Você ainda não participa do programa de fidelidade. <Link to={ROTAS.fidelidade}>Ativar (requer consentimento LGPD)</Link>.
              </Alert>
            ) : (
              <p className="texto-suave">Pedido sem identificação: pontos de fidelidade não serão acumulados.</p>
            )}

            <div className="linha mt-4" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <FormField
                  label="Código promocional"
                  name="codigo"
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value.toUpperCase())
                    setPromo(null)
                    setErros((x) => ({ ...x, codigo: '' }))
                  }}
                  erro={erros.codigo || (promo && !promo.valida ? promo.motivo : undefined)}
                  autoComplete="off"
                  placeholder="Ex.: BEMVINDO10"
                />
              </div>
              <Button variante="contorno" onClick={() => validarPromocao(codigo)} carregando={validandoPromo} disabled={!codigo.trim()}>
                Aplicar
              </Button>
            </div>
            {promo?.valida && (
              <p className="texto-pequeno" style={{ color: 'var(--cor-sucesso)' }}>
                ✓ {promo.promocao?.titulo} aplicada.{' '}
                <button
                  type="button"
                  className="btn btn--fantasma btn--pequeno"
                  onClick={() => {
                    setPromo(null)
                    setCodigo('')
                  }}
                >
                  Remover
                </button>
              </p>
            )}
            <Link to={ROTAS.promocoes} className="texto-pequeno">
              Ver promoções disponíveis
            </Link>
          </section>

          <section className="card" aria-labelledby="retirada">
            <h2 id="retirada" className="card__titulo">
              Forma de retirada
            </h2>
            <div className="opcoes-radio" role="radiogroup" aria-labelledby="retirada">
              {FORMAS_RETIRADA.map((f) => (
                <label key={f.valor} className="opcao-radio">
                  <input type="radio" name="formaRetirada" value={f.valor} checked={formaRetirada === f.valor} onChange={() => setFormaRetirada(f.valor)} />
                  <span className="opcao-radio__texto">
                    <strong>{f.titulo}</strong>
                    <span className="opcao-radio__desc">{f.descricao}</span>
                  </span>
                </label>
              ))}
            </div>
            {!cliente && (
              <div className="mt-4">
                <FormField
                  label="Nome para retirada"
                  name="nomeRetirada"
                  value={nomeRetirada}
                  onChange={(e) => setNomeRetirada(e.target.value)}
                  erro={erros.nomeRetirada}
                  obrigatorio
                  autoComplete="given-name"
                  ajuda="Usamos apenas para chamar você no balcão. Não é armazenado após a retirada."
                />
              </div>
            )}
          </section>
        </div>

        <aside className="card barra-fixa" aria-labelledby="resumo-rev">
          <h2 id="resumo-rev" className="card__titulo">
            Resumo
          </h2>
          <OrderSummary subtotal={subtotal} descontoFidelidade={descontoFidelidade} descontoPromocao={descontoPromocao} rotuloPromocao={promo?.valida ? promo.promocao?.codigo : null} total={total} />
          {cliente && (
            <p className="texto-pequeno texto-suave mt-4">
              Pedido em nome de <strong>{cliente.nome}</strong> ({cliente.email}). Esses dados identificam o pedido; veja a <Link to={ROTAS.privacidade}>Política de Privacidade</Link>.
            </p>
          )}
          <div className="mt-4">
            <Button type="submit" variante="primario" tamanho="grande" bloco carregando={enviando}>
              Confirmar pedido e ir para pagamento
            </Button>
          </div>
          <p className="texto-pequeno texto-suave texto-centro mt-4">Nenhuma cobrança é feita nesta etapa.</p>
        </aside>
      </div>
    </form>
  )
}
