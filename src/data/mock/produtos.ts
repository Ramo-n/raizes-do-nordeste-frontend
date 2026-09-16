import type { ItemCardapio } from '@/types'

/** Catálogo base de produtos — espelha a tabela `produto` do Back-End (ids 1–6) + extras (7–10). */
export interface ProdutoBase {
  id: number
  nome: string
  descricao: string
  categoria: string
  imagem: string
  ingredientes: string[]
  alergenos: string[]
  tempoPreparoMin: number
  destaque?: boolean
}

export const produtosMock: ProdutoBase[] = [
  {
    id: 1,
    nome: 'Tapioca de queijo coalho',
    descricao: 'Tapioca recheada com queijo coalho derretido na chapa, servida quentinha.',
    categoria: 'Tapiocas',
    imagem: '🫓',
    ingredientes: ['Goma de tapioca hidratada', 'Queijo coalho', 'Manteiga de garrafa'],
    alergenos: ['Leite'],
    tempoPreparoMin: 8,
    destaque: true,
  },
  {
    id: 2,
    nome: 'Cuscuz recheado',
    descricao: 'Cuscuz nordestino de milho flocado com recheio de carne de sol desfiada e queijo.',
    categoria: 'Cuscuz',
    imagem: '🌽',
    ingredientes: ['Flocão de milho', 'Carne de sol', 'Queijo coalho', 'Manteiga de garrafa'],
    alergenos: ['Leite'],
    tempoPreparoMin: 12,
    destaque: true,
  },
  {
    id: 3,
    nome: 'Bolo de macaxeira',
    descricao: 'Bolo tradicional de macaxeira com coco, macio e úmido.',
    categoria: 'Bolos',
    imagem: '🍰',
    ingredientes: ['Macaxeira', 'Coco ralado', 'Leite de coco', 'Ovos', 'Açúcar'],
    alergenos: ['Ovo', 'Leite'],
    tempoPreparoMin: 3,
  },
  {
    id: 4,
    nome: 'Suco de cajá',
    descricao: 'Suco natural de cajá, fruta típica do Nordeste. 400 ml.',
    categoria: 'Sucos',
    imagem: '🥤',
    ingredientes: ['Polpa de cajá', 'Água filtrada', 'Açúcar (opcional)'],
    alergenos: [],
    tempoPreparoMin: 4,
  },
  {
    id: 5,
    nome: 'Café da manhã completo',
    descricao: 'Café passado na hora, cuscuz com manteiga de garrafa, dois ovos e pão de milho.',
    categoria: 'Combos',
    imagem: '🍽️',
    ingredientes: ['Café coado', 'Cuscuz', 'Ovos', 'Manteiga de garrafa', 'Pão de milho'],
    alergenos: ['Ovo', 'Leite', 'Glúten'],
    tempoPreparoMin: 15,
    destaque: true,
  },
  {
    id: 6,
    nome: 'Canjica junina',
    descricao: 'Canjica cremosa com leite, coco e canela — receita típica do período junino.',
    categoria: 'Sazonais',
    imagem: '🎉',
    ingredientes: ['Milho branco', 'Leite', 'Leite condensado', 'Coco', 'Canela'],
    alergenos: ['Leite'],
    tempoPreparoMin: 5,
  },
  {
    id: 7,
    nome: 'Tapioca de carne de sol',
    descricao: 'Tapioca recheada com carne de sol desfiada, queijo coalho e cebola roxa.',
    categoria: 'Tapiocas',
    imagem: '🫓',
    ingredientes: ['Goma de tapioca', 'Carne de sol', 'Queijo coalho', 'Cebola roxa'],
    alergenos: ['Leite'],
    tempoPreparoMin: 10,
  },
  {
    id: 8,
    nome: 'Bolo de rolo',
    descricao: 'Camadas finíssimas de massa com goiabada — patrimônio cultural de Pernambuco.',
    categoria: 'Bolos',
    imagem: '🍥',
    ingredientes: ['Farinha de trigo', 'Ovos', 'Manteiga', 'Goiabada'],
    alergenos: ['Glúten', 'Ovo', 'Leite'],
    tempoPreparoMin: 3,
  },
  {
    id: 9,
    nome: 'Suco de umbu',
    descricao: 'Suco refrescante de umbu, fruta do sertão. 400 ml.',
    categoria: 'Sucos',
    imagem: '🥤',
    ingredientes: ['Polpa de umbu', 'Água filtrada'],
    alergenos: [],
    tempoPreparoMin: 4,
  },
  {
    id: 10,
    nome: 'Cuscuz com ovo e queijo',
    descricao: 'Cuscuz de milho com ovo mexido e queijo coalho — o clássico do balcão.',
    categoria: 'Cuscuz',
    imagem: '🌽',
    ingredientes: ['Flocão de milho', 'Ovos', 'Queijo coalho'],
    alergenos: ['Ovo', 'Leite'],
    tempoPreparoMin: 9,
  },
]

/** Vínculo produto × unidade — espelha a tabela `produto_unidade` do Back-End. */
export interface ProdutoUnidadeMock {
  produtoId: number
  unidadeId: number
  preco: number
  disponivel: boolean
  motivoIndisponibilidade?: string
  sazonal: boolean
  mesInicioSazonalidade: number | null
  mesFimSazonalidade: number | null
  variacaoRegional: string | null
}

export const produtoUnidadeMock: ProdutoUnidadeMock[] = [
  // Unidade 1 — Recife Centro (cozinha completa)
  { produtoId: 1, unidadeId: 1, preco: 12.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 2, unidadeId: 1, preco: 10.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 3, unidadeId: 1, preco: 8.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 4, unidadeId: 1, preco: 7.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 5, unidadeId: 1, preco: 25.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 6, unidadeId: 1, preco: 9.0, disponivel: true, sazonal: true, mesInicioSazonalidade: 5, mesFimSazonalidade: 7, variacaoRegional: null },
  { produtoId: 7, unidadeId: 1, preco: 15.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 8, unidadeId: 1, preco: 9.5, disponivel: false, motivoIndisponibilidade: 'Esgotado hoje', sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 9, unidadeId: 1, preco: 7.5, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 10, unidadeId: 1, preco: 11.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },

  // Unidade 2 — São Paulo Paulista (cozinha reduzida, preços regionais)
  { produtoId: 1, unidadeId: 2, preco: 14.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: 'Queijo coalho levemente tostado' },
  { produtoId: 2, unidadeId: 2, preco: 12.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 4, unidadeId: 2, preco: 9.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 3, unidadeId: 2, preco: 9.5, disponivel: false, motivoIndisponibilidade: 'Fora do cardápio desta unidade hoje', sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 8, unidadeId: 2, preco: 11.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: 'Versão individual' },

  // Unidade 3 — Salvador (fechada no momento; cardápio existe para consulta)
  { produtoId: 1, unidadeId: 3, preco: 12.5, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 4, unidadeId: 3, preco: 7.5, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: null },
  { produtoId: 9, unidadeId: 3, preco: 8.0, disponivel: true, sazonal: false, mesInicioSazonalidade: null, mesFimSazonalidade: null, variacaoRegional: 'Umbu da Chapada' },
]

/** Verifica se um item sazonal está dentro do período (mesmo critério de `ProdutoUnidade.disponivelEm` do Back-End). */
export function dentroDaSazonalidade(pu: ProdutoUnidadeMock, hoje: Date): boolean {
  if (!pu.sazonal || pu.mesInicioSazonalidade == null || pu.mesFimSazonalidade == null) return true
  const mes = hoje.getMonth() + 1
  return mes >= pu.mesInicioSazonalidade && mes <= pu.mesFimSazonalidade
}

/** Monta o cardápio de uma unidade (equivalente a `CardapioService.cardapioDaUnidade`). */
export function montarCardapio(unidadeId: number, hoje: Date = new Date()): ItemCardapio[] {
  return produtoUnidadeMock
    .filter((pu) => pu.unidadeId === unidadeId)
    .map((pu) => {
      const base = produtosMock.find((p) => p.id === pu.produtoId)
      if (!base) return null
      const foraDeEpoca = !dentroDaSazonalidade(pu, hoje)
      const item: ItemCardapio = {
        produtoId: base.id,
        nome: base.nome,
        descricao: base.descricao,
        categoria: base.categoria,
        preco: pu.preco,
        variacaoRegional: pu.variacaoRegional,
        sazonal: pu.sazonal,
        disponivel: pu.disponivel && !foraDeEpoca,
        motivoIndisponibilidade: foraDeEpoca ? 'Produto sazonal — disponível de maio a julho' : pu.motivoIndisponibilidade,
        imagem: base.imagem,
        ingredientes: base.ingredientes,
        alergenos: base.alergenos,
        tempoPreparoMin: base.tempoPreparoMin,
        destaque: base.destaque,
      }
      return item
    })
    .filter((i): i is ItemCardapio => i !== null)
}
