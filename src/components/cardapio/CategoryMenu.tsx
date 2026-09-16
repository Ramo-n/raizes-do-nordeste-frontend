import type { Categoria } from '@/types'

interface CategoryMenuProps {
  categorias: Categoria[]
  selecionada: string | null
  aoSelecionar: (id: string | null) => void
  contagem?: Record<string, number>
}

/** Filtro de categorias (toolbar de botões toggle, rolável no mobile). */
export function CategoryMenu({ categorias, selecionada, aoSelecionar, contagem }: CategoryMenuProps) {
  return (
    <div className="categorias" role="toolbar" aria-label="Categorias do cardápio">
      <button type="button" className="categorias__item" aria-pressed={selecionada === null} onClick={() => aoSelecionar(null)}>
        Todos
      </button>
      {categorias.map((c) => (
        <button key={c.id} type="button" className="categorias__item" aria-pressed={selecionada === c.id} onClick={() => aoSelecionar(c.id)} title={c.descricao}>
          <span aria-hidden="true">{c.icone}</span> {c.nome}
          {contagem && contagem[c.id] !== undefined && <span className="sr-only"> ({contagem[c.id]} itens)</span>}
        </button>
      ))}
    </div>
  )
}
