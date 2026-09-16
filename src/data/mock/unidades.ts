import type { Unidade } from '@/types'

/**
 * Unidades da rede. As duas primeiras espelham o `data.sql` do Back-End;
 * as demais existem apenas no Mock para demonstrar expansão e o fluxo
 * alternativo "unidade indisponível/fechada".
 */
export const unidadesMock: Unidade[] = [
  {
    id: 1,
    nome: 'Raízes Recife Centro',
    cidade: 'Recife',
    uf: 'PE',
    regiao: 'Nordeste',
    tipoCozinha: 'COMPLETA',
    horarioFuncionamento: '06:00-22:00',
    ativa: true,
    endereco: 'Rua da Aurora, 120 — Boa Vista',
    statusOperacional: 'ABERTA',
  },
  {
    id: 2,
    nome: 'Raízes São Paulo Paulista',
    cidade: 'São Paulo',
    uf: 'SP',
    regiao: 'Sudeste',
    tipoCozinha: 'REDUZIDA',
    horarioFuncionamento: '06:30-21:00',
    ativa: true,
    endereco: 'Av. Paulista, 1500 — Bela Vista',
    statusOperacional: 'ABERTA',
  },
  {
    id: 3,
    nome: 'Raízes Salvador Pelourinho',
    cidade: 'Salvador',
    uf: 'BA',
    regiao: 'Nordeste',
    tipoCozinha: 'COMPLETA',
    horarioFuncionamento: '07:00-20:00',
    ativa: true,
    endereco: 'Largo do Pelourinho, 8 — Centro Histórico',
    statusOperacional: 'FECHADA',
  },
  {
    id: 4,
    nome: 'Raízes Fortaleza Beira-Mar',
    cidade: 'Fortaleza',
    uf: 'CE',
    regiao: 'Nordeste',
    tipoCozinha: 'REDUZIDA',
    horarioFuncionamento: '06:00-22:00',
    ativa: false,
    endereco: 'Av. Beira-Mar, 2900 — Meireles',
    statusOperacional: 'INDISPONIVEL',
  },
]
