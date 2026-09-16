import { Button, Chip } from '@/components/ui'
import type { Promocao } from '@/types'
import { formatarData, formatarMoeda } from '@/utils/format'

interface PromotionCardProps {
  promocao: Promocao
  aoUsar?: (codigo: string) => void
  aoCopiar?: (codigo: string) => void
}

/** RF13 — Promoções e campanhas. Estados: ativa, expirada, restrita a canal/unidade. */
export function PromotionCard({ promocao, aoUsar, aoCopiar }: PromotionCardProps) {
  const agora = new Date()
  const expirada = !promocao.ativa || agora > new Date(promocao.validadeFim) || agora < new Date(promocao.validadeInicio)
  const beneficio = promocao.tipo === 'PERCENTUAL' ? `${promocao.valor}% de desconto` : `${formatarMoeda(promocao.valor)} de desconto`

  return (
    <article className={`card ${promocao.destaque && !expirada ? 'card--destaque' : ''}`} aria-labelledby={`promo-${promocao.id}`} style={{ opacity: expirada ? 0.75 : 1 }}>
      <div className="linha linha--entre">
        <h3 id={`promo-${promocao.id}`} className="card__titulo" style={{ margin: 0 }}>
          🏷️ {promocao.titulo}
        </h3>
        {expirada ? <Chip tipo="erro">Encerrada</Chip> : promocao.destaque ? <Chip tipo="primario">Destaque</Chip> : <Chip tipo="sucesso">Ativa</Chip>}
      </div>
      <p className="texto-suave" style={{ margin: 'var(--esp-2) 0' }}>
        {promocao.descricao}
      </p>
      <dl className="lista-detalhes texto-pequeno">
        <div className="linha linha--entre">
          <dt>Benefício</dt>
          <dd>
            <strong>{beneficio}</strong>
          </dd>
        </div>
        {promocao.valorMinimoPedido > 0 && (
          <div className="linha linha--entre">
            <dt>Pedido mínimo</dt>
            <dd>{formatarMoeda(promocao.valorMinimoPedido)}</dd>
          </div>
        )}
        <div className="linha linha--entre">
          <dt>Validade</dt>
          <dd>até {formatarData(promocao.validadeFim)}</dd>
        </div>
        {promocao.canais && (
          <div className="linha linha--entre">
            <dt>Canais</dt>
            <dd>{promocao.canais.join(', ')}</dd>
          </div>
        )}
        {promocao.unidadeIds && (
          <div className="linha linha--entre">
            <dt>Unidades</dt>
            <dd>Somente unidades participantes</dd>
          </div>
        )}
      </dl>
      <div className="linha mt-4">
        <code className="chip chip--info" aria-label={`Código ${promocao.codigo}`}>
          {promocao.codigo}
        </code>
        {aoCopiar && (
          <Button tamanho="pequeno" variante="fantasma" onClick={() => aoCopiar(promocao.codigo)} disabled={expirada}>
            Copiar código
          </Button>
        )}
        {aoUsar && (
          <Button tamanho="pequeno" variante="primario" onClick={() => aoUsar(promocao.codigo)} disabled={expirada}>
            Usar no pedido
          </Button>
        )}
      </div>
    </article>
  )
}
