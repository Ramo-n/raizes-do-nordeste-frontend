import { Link } from 'react-router-dom'
import { Button, Chip } from '@/components/ui'
import { ROTAS } from '@/routes/paths'
import type { ItemCardapio } from '@/types'
import { formatarMoeda } from '@/utils/format'

interface ProductCardProps {
  item: ItemCardapio
  aoAdicionar?: (item: ItemCardapio) => void
}

/** Card do produto; indisponíveis exibem estado textual e botão desabilitado (RN02). */
export function ProductCard({ item, aoAdicionar }: ProductCardProps) {
  const indisponivel = !item.disponivel
  return (
    <article className={['produto', indisponivel && 'produto--indisponivel'].filter(Boolean).join(' ')} aria-labelledby={`produto-${item.produtoId}-nome`}>
      <div className="produto__imagem" aria-hidden="true">
        {item.imagem}
      </div>
      <div className="produto__corpo">
        <div className="produto__tags">
          {item.destaque && <Chip tipo="ouro">Destaque</Chip>}
          {item.sazonal && <Chip tipo="info">Sazonal</Chip>}
          {item.variacaoRegional && <Chip>{item.variacaoRegional}</Chip>}
          {indisponivel && <Chip tipo="erro">Indisponível</Chip>}
        </div>
        <h3 className="produto__nome" id={`produto-${item.produtoId}-nome`}>
          <Link to={ROTAS.produto(item.produtoId)} style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.nome}
          </Link>
        </h3>
        <p className="produto__descricao">{item.descricao}</p>
        <div className="produto__rodape">
          <span className="produto__preco">{formatarMoeda(item.preco)}</span>
          {aoAdicionar && (
            <Button
              variante="primario"
              tamanho="pequeno"
              onClick={() => aoAdicionar(item)}
              disabled={indisponivel}
              aria-label={indisponivel ? `${item.nome} indisponível` : `Adicionar ${item.nome} ao carrinho`}
            >
              {indisponivel ? 'Indisponível' : 'Adicionar'}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
