import type { Categoria } from '@/types'

/** Categorias do cardápio — coincidem com o campo `categoria` de `produto` no Back-End. */
export const categoriasMock: Categoria[] = [
  { id: 'Combos', nome: 'Combos', descricao: 'Refeições completas para começar bem o dia', icone: '🍽️' },
  { id: 'Tapiocas', nome: 'Tapiocas', descricao: 'Tapiocas artesanais com recheios regionais', icone: '🫓' },
  { id: 'Cuscuz', nome: 'Cuscuz', descricao: 'Cuscuz nordestino de milho flocado', icone: '🌽' },
  { id: 'Bolos', nome: 'Bolos', descricao: 'Bolos caseiros da tradição nordestina', icone: '🍰' },
  { id: 'Sucos', nome: 'Sucos', descricao: 'Frutas regionais, sem conservantes', icone: '🥤' },
  { id: 'Sazonais', nome: 'Sazonais', descricao: 'Receitas de época (festas juninas)', icone: '🎉' },
]
