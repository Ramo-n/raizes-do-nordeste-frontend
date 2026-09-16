import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CategoryMenu } from '@/components/cardapio/CategoryMenu'
import { ProductCard } from '@/components/cardapio/ProductCard'
import { Button, EmptyState, ErrorState, LinkButton, LoadingState } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { useCart } from '@/store/CartContext'
import { useChannel } from '@/store/ChannelContext'
import { useToast } from '@/store/ToastContext'
import { useUnit } from '@/store/UnitContext'
import type { ItemCardapio } from '@/types'

/** UC04 — Consultar Cardápio (RF03, RF04, RF06). */
export function CardapioPage() {
  const { unidade } = useUnit()
  const { adicionar, totalItens } = useCart()
  const { notificar } = useToast()
  const { canal } = useChannel()
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState<string | null>(null)
  const unidadeId = unidade?.id ?? null

  const cardapio = useAsync(
    async () => {
      const [categorias, itens] = await Promise.all([servicos.cardapio.listarCategorias(), servicos.cardapio.cardapioDaUnidade(unidadeId as number)])
      return { categorias, itens }
    },
    [unidadeId],
    { estaVazio: (d) => d.itens.length === 0, habilitado: unidadeId !== null },
  )

  const itensFiltrados = useMemo(() => {
    const itens = cardapio.dados?.itens ?? []
    return categoria ? itens.filter((i) => i.categoria === categoria) : itens
  }, [cardapio.dados, categoria])

  const contagem = useMemo(() => {
    const c: Record<string, number> = {}
    for (const i of cardapio.dados?.itens ?? []) c[i.categoria] = (c[i.categoria] ?? 0) + 1
    return c
  }, [cardapio.dados])

  if (!unidade) return <Navigate to={ROTAS.unidades} replace />

  const aoAdicionar = (item: ItemCardapio) => {
    adicionar(unidade.id, item, 1)
    notificar(`${item.nome} adicionado ao carrinho.`, 'sucesso')
  }

  return (
    <div>
      <div className="pagina__cabecalho">
        <div>
          <h1>Cardápio</h1>
          <p className="pagina__subtitulo">
            {unidade.nome} · <LinkButton to={ROTAS.unidades} variante="fantasma" tamanho="pequeno" style={{ padding: 0, minHeight: 0 }}>Trocar unidade</LinkButton>
          </p>
        </div>
        {totalItens > 0 && (
          <Button variante="secundario" onClick={() => navigate(ROTAS.carrinho)}>
            Ver carrinho ({totalItens})
          </Button>
        )}
      </div>

      {cardapio.estado === 'loading' && <LoadingState mensagem="Carregando cardápio..." />}
      {cardapio.estado === 'error' && (
        <ErrorState erro={cardapio.erro} titulo="Erro ao carregar o cardápio" aoTentarNovamente={cardapio.recarregar} acao={<LinkButton to={ROTAS.unidades}>Escolher outra unidade</LinkButton>} />
      )}
      {cardapio.estado === 'empty' && <EmptyState titulo="Cardápio vazio" descricao="Esta unidade ainda não possui itens disponíveis hoje." icone="🍽️" acao={<LinkButton to={ROTAS.unidades}>Escolher outra unidade</LinkButton>} />}

      {cardapio.estado === 'success' && cardapio.dados && (
        <>
          <CategoryMenu
            categorias={cardapio.dados.categorias.filter((c) => contagem[c.id])}
            selecionada={categoria}
            aoSelecionar={setCategoria}
            contagem={contagem}
          />
          <p className="sr-only" aria-live="polite">
            {itensFiltrados.length} produtos exibidos
          </p>
          {itensFiltrados.length === 0 ? (
            <EmptyState titulo="Nenhum produto nesta categoria" icone="🔎" acao={<Button onClick={() => setCategoria(null)}>Ver todos</Button>} />
          ) : (
            <ul className={`grade ${canal === 'TOTEM' ? 'grade--2' : 'grade--2 grade--3'}`} aria-label="Produtos">
              {itensFiltrados.map((item) => (
                <li key={item.produtoId}>
                  <ProductCard item={item} aoAdicionar={aoAdicionar} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
