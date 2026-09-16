import type { Cliente, Fidelidade, MovimentoFidelidade, NivelFidelidade, Usuario } from '@/types'

/** Clientes — espelha `data.sql` do Back-End. */
export const clientesMock: Cliente[] = [
  {
    id: 1,
    nome: 'Maria das Dores',
    email: 'maria@exemplo.com',
    dataNascimento: '1985-03-10',
    consentimentoLgpd: true,
    dataConsentimento: '2026-01-15T09:30:00',
    anonimizado: false,
  },
  {
    id: 2,
    nome: 'João Severino',
    email: 'joao@exemplo.com',
    dataNascimento: '1990-06-24',
    consentimentoLgpd: false,
    dataConsentimento: null,
    anonimizado: false,
  },
]

/**
 * Usuários de acesso — espelha os usuários seed do Back-End (`DataSeeder`).
 * A senha local de todos é "123456" (mesma do README do Back-End).
 * ATENÇÃO: simulação acadêmica — nunca armazene senhas em texto puro em produção.
 */
export interface UsuarioMock extends Usuario {
  senha: string
}

export const usuariosMock: UsuarioMock[] = [
  { id: 1, email: 'cliente@raizes.com', senha: '123456', perfil: 'CLIENTE', clienteId: 1, ativo: true },
  { id: 2, email: 'maria@exemplo.com', senha: '123456', perfil: 'CLIENTE', clienteId: 1, ativo: true },
  { id: 3, email: 'joao@exemplo.com', senha: '123456', perfil: 'CLIENTE', clienteId: 2, ativo: true },
  { id: 4, email: 'atendente@raizes.com', senha: '123456', perfil: 'ATENDENTE', clienteId: null, ativo: true },
  { id: 5, email: 'gerente@raizes.com', senha: '123456', perfil: 'GERENTE', clienteId: null, ativo: true },
  { id: 6, email: 'matriz@raizes.com', senha: '123456', perfil: 'MATRIZ', clienteId: null, ativo: true },
]

const historicoMaria: MovimentoFidelidade[] = [
  { id: 'mov-1', data: '2026-02-03T08:12:00', descricao: 'Pedido #1001 — Recife Centro', pontos: 45 },
  { id: 'mov-2', data: '2026-03-18T07:55:00', descricao: 'Pedido #1017 — Recife Centro', pontos: 32 },
  { id: 'mov-3', data: '2026-05-02T09:40:00', descricao: 'Pedido #1042 — São Paulo Paulista', pontos: 43 },
]

/** Contas de fidelidade — cliente 1 possui 120 pontos no seed do Back-End. */
export const fidelidadeMock: Fidelidade[] = [
  {
    clienteId: 1,
    pontos: 120,
    percentualDesconto: 5,
    frequenciaConsumo: 3,
    nivel: 'BRONZE',
    pontosProximoNivel: 500,
    historico: historicoMaria,
  },
]

/**
 * Regras de benefício — espelham `ContaFidelidade.percentualDesconto()` do Back-End:
 * 1 ponto por real gasto; 100+ → 5%, 500+ → 10%, 1000+ → 15%.
 */
export interface NivelRegra {
  nivel: NivelFidelidade
  minimo: number
  percentual: number
}

export const REGRAS_FIDELIDADE: { pontosPorReal: number; niveis: NivelRegra[] } = {
  pontosPorReal: 1,
  niveis: [
    { nivel: 'INICIANTE', minimo: 0, percentual: 0 },
    { nivel: 'BRONZE', minimo: 100, percentual: 5 },
    { nivel: 'PRATA', minimo: 500, percentual: 10 },
    { nivel: 'OURO', minimo: 1000, percentual: 15 },
  ],
}
