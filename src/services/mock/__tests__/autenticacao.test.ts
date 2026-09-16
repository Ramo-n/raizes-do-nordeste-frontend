import { beforeEach, describe, expect, it } from 'vitest'
import { ErroNaoAutenticado, ErroValidacao } from '@/services/errors'
import type { Servicos } from '@/services/contracts'
import { CREDENCIAIS_VALIDAS, servicosLimpos } from '@/test/helpers'

describe('UC01/UC02 — Cadastro e autenticação (RF01, RF02)', () => {
  let s: Servicos
  beforeEach(() => {
    s = servicosLimpos()
  })

  it('CT01 — cadastro válido cria sessão, cliente e conta de fidelidade com consentimento registrado', async () => {
    const sessao = await s.auth.cadastrar({ nome: 'Ana Souza', email: 'ana@exemplo.com', senha: 'segredo1', consentimentoLgpd: true })
    expect(sessao.role).toBe('CLIENTE')
    expect(sessao.cliente?.email).toBe('ana@exemplo.com')
    expect(sessao.cliente?.consentimentoLgpd).toBe(true)
    expect(sessao.cliente?.dataConsentimento).not.toBeNull()
    const fid = await s.fidelidade.consultar(sessao.cliente!.id)
    expect(fid.pontos).toBe(0)
    expect(fid.nivel).toBe('INICIANTE')
  })

  it('CT02 — cadastro inválido (senha curta, e-mail inválido, sem consentimento) é rejeitado com mensagens por campo', async () => {
    const erro = await s.auth.cadastrar({ nome: 'A', email: 'email-invalido', senha: '123', consentimentoLgpd: false }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroValidacao)
    expect(erro.detalhes).toMatchObject({
      nome: expect.any(String),
      email: expect.any(String),
      senha: expect.any(String),
      consentimento: expect.any(String),
    })
  })

  it('CT02b — cadastro com e-mail já existente é rejeitado', async () => {
    const erro = await s.auth.cadastrar({ nome: 'Maria Duplicada', email: CREDENCIAIS_VALIDAS.email, senha: '1234567', consentimentoLgpd: true }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroValidacao)
    expect(erro.detalhes.email).toMatch(/já existe uma conta/i)
  })

  it('CT03 — login válido retorna sessão Bearer e persiste no storage', async () => {
    const sessao = await s.auth.login(CREDENCIAIS_VALIDAS)
    expect(sessao.tokenType).toBe('Bearer')
    expect(sessao.accessToken.split('.')).toHaveLength(3)
    expect(sessao.cliente?.nome).toBe('Maria das Dores')
    expect(s.auth.sessaoAtual()?.email).toBe(CREDENCIAIS_VALIDAS.email)
  })

  it('CT04 — login inválido (senha errada) falha com mensagem genérica, sem revelar qual campo está errado', async () => {
    const erro = await s.auth.login({ email: CREDENCIAIS_VALIDAS.email, senha: 'errada' }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroNaoAutenticado)
    expect(erro.message).toMatch(/e-mail ou senha inválidos/i)
    expect(s.auth.sessaoAtual()).toBeNull()
  })

  it('CT04b — login com campos vazios é barrado pela validação', async () => {
    const erro = await s.auth.login({ email: '', senha: '' }).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroValidacao)
  })

  it('CT15 — LGPD: consentimento pode ser concedido depois e anonimização remove dados pessoais', async () => {
    const sessao = await s.auth.cadastrar({ nome: 'Carlos Lima', email: 'carlos@exemplo.com', senha: 'segredo1', consentimentoLgpd: true })
    const id = sessao.cliente!.id
    await s.clientes.solicitarAnonimizacao(id)
    const anonimizado = await s.clientes.obter(id)
    expect(anonimizado.anonimizado).toBe(true)
    expect(anonimizado.email).not.toContain('carlos@')
    expect(anonimizado.nome).not.toBe('Carlos Lima')
    expect(anonimizado.consentimentoLgpd).toBe(false)
    expect(s.auth.sessaoAtual()).toBeNull()
    // fidelidade passa a exigir novo consentimento (RN06)
    await expect(s.fidelidade.consultar(id)).rejects.toThrow(/consentimento LGPD/i)
    // login da conta anonimizada deixa de funcionar
    await expect(s.auth.login({ email: 'carlos@exemplo.com', senha: 'segredo1' })).rejects.toBeInstanceOf(ErroNaoAutenticado)
  })
})
