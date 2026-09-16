import { useState } from 'react'
import { Alert, Button, Chip, QuantitySelector } from '@/components/ui'
import type { ItemCardapio } from '@/types'
import { formatarMoeda } from '@/utils/format'

interface ProductDetailsProps {
  item: ItemCardapio
  aoAdicionar: (item: ItemCardapio, quantidade: number) => void
  aoVoltar: () => void
}

/** Detalhes do produto (RF05) com seleção de quantidade e adição ao carrinho (RF06). */
export function ProductDetails({ item, aoAdicionar, aoVoltar }: ProductDetailsProps) {
  const [quantidade, setQuantidade] = useState(1)
  const indisponivel = !item.disponivel

  return (
    <article className="container-estreito" aria-labelledby="produto-titulo">
      <div className="produto-detalhe__imagem" aria-hidden="true">
        {item.imagem}
      </div>
      <div className="produto__tags mb-4">
        {item.destaque && <Chip tipo="ouro">Destaque</Chip>}
        {item.sazonal && <Chip tipo="info">Sazonal</Chip>}
        {item.variacaoRegional && <Chip>{item.variacaoRegional}</Chip>}
        <Chip>
          <span aria-hidden="true">⏱</span> ~{item.tempoPreparoMin} min
        </Chip>
      </div>
      <h1 id="produto-titulo">{item.nome}</h1>
      <p className="texto-suave">{item.descricao}</p>

      <dl className="lista-detalhes mb-4">
        <dt>Categoria</dt>
        <dd>{item.categoria}</dd>
        <dt>Ingredientes</dt>
        <dd>{item.ingredientes.join(', ') || '—'}</dd>
        <dt>Alérgenos</dt>
        <dd>{item.alergenos.length ? item.alergenos.join(', ') : 'Nenhum informado'}</dd>
      </dl>

      {indisponivel && (
        <Alert tipo="alerta" titulo="Produto indisponível nesta unidade">
          {item.motivoIndisponibilidade ?? 'Este item não pode ser adicionado ao pedido no momento.'}
        </Alert>
      )}

      <div className="card mt-4">
        <div className="linha linha--entre">
          <span className="produto__preco" style={{ fontSize: 'var(--tam-xl)' }}>
            {formatarMoeda(item.preco)}
          </span>
          <QuantitySelector valor={quantidade} aoAlterar={setQuantidade} desabilitado={indisponivel} />
        </div>
        <div className="pilha mt-4">
          <Button variante="primario" tamanho="grande" bloco disabled={indisponivel} onClick={() => aoAdicionar(item, quantidade)}>
            {indisponivel ? 'Indisponível' : `Adicionar ${quantidade} ao carrinho · ${formatarMoeda(item.preco * quantidade)}`}
          </Button>
          <Button variante="fantasma" bloco onClick={aoVoltar}>
            ← Voltar ao cardápio
          </Button>
        </div>
      </div>
    </article>
  )
}
