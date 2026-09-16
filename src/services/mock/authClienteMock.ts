import { STORAGE_KEYS } from '@/config/env'
import type { AuthService, ClienteService, FidelidadeService } from '@/services/contracts'
import { ErroNaoAutenticado, ErroNaoEncontrado, ErroNegocio, ErroValidacao } from '@/services/errors'
import type { Cliente, CredenciaisLogin, Fidelidade, NovoCliente, Sessao } from '@/types'
import { agoraIso } from '@/utils/async'
import { storage } from '@/utils/storage'
import { validarCadastro, validarLogin, temErros } from '@/utils/validation'
import { simularRede } from './base'
import { obterDb, salvarDb } from './mockDb'
import { REGRAS_FIDELIDADE } from '@/data/mock'

/** Gera um token "parecido" com JWT apenas para demonstração — não possui assinatura válida. */
function tokenSimulado(email: string, role: string): string {
  const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/=+$/, '')
  const agora = Math.floor(Date.now() / 1000)
  return `${b64('{"alg":"none","typ":"JWT"}')}.${b64(JSON.stringify({ sub: email, role, iat: agora, exp: agora + 7200 }))}.simulado`
}

export class AuthServiceMock implements AuthService {
  async login(credenciais: CredenciaisLogin): Promise<Sessao> {
    await simularRede()
    const erros = validarLogin(credenciais)
    if (temErros(erros)) throw new ErroValidacao('Preencha e-mail e senha.', erros as Record<string, string>)

    const db = obterDb()
    const usuario = db.usuarios.find((u) => u.email.toLowerCase() === credenciais.email.trim().toLowerCase() && u.ativo)
    if (!usuario || usuario.senha !== credenciais.senha) throw new ErroNaoAutenticado()

    const cliente = usuario.clienteId != null ? (db.clientes.find((c) => c.id === usuario.clienteId) ?? null) : null
    const sessao: Sessao = {
      accessToken: tokenSimulado(usuario.email, usuario.perfil),
      tokenType: 'Bearer',
      email: usuario.email,
      role: usuario.perfil,
      cliente: cliente ? structuredClone(cliente) : null,
    }
    storage.set(STORAGE_KEYS.sessao, sessao)
    return sessao
  }

  async cadastrar(dados: NovoCliente): Promise<Sessao> {
    await simularRede()
    const erros = validarCadastro({
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      confirmacao: dados.senha,
      consentimento: dados.consentimentoLgpd,
    })
    if (temErros(erros)) throw new ErroValidacao('Verifique os campos destacados.', erros as Record<string, string>)

    const db = obterDb()
    const email = dados.email.trim().toLowerCase()
    if (db.usuarios.some((u) => u.email.toLowerCase() === email)) {
      throw new ErroValidacao('Já existe uma conta com este e-mail.', { email: 'Já existe uma conta com este e-mail. Faça login ou use outro e-mail.' })
    }

    const cliente: Cliente = {
      id: db.proximoClienteId++,
      nome: dados.nome.trim(),
      email,
      dataNascimento: dados.dataNascimento ?? null,
      consentimentoLgpd: dados.consentimentoLgpd,
      dataConsentimento: dados.consentimentoLgpd ? agoraIso() : null,
      anonimizado: false,
    }
    db.clientes.push(cliente)
    db.usuarios.push({ id: db.proximoUsuarioId++, email, senha: dados.senha, perfil: 'CLIENTE', clienteId: cliente.id, ativo: true })
    if (cliente.consentimentoLgpd) {
      db.fidelidade.push({ clienteId: cliente.id, pontos: 0, percentualDesconto: 0, frequenciaConsumo: 0, nivel: 'INICIANTE', pontosProximoNivel: 100, historico: [] })
    }
    salvarDb()

    const sessao: Sessao = {
      accessToken: tokenSimulado(email, 'CLIENTE'),
      tokenType: 'Bearer',
      email,
      role: 'CLIENTE',
      cliente: structuredClone(cliente),
    }
    storage.set(STORAGE_KEYS.sessao, sessao)
    return sessao
  }

  sessaoAtual(): Sessao | null {
    return storage.get<Sessao | null>(STORAGE_KEYS.sessao, null)
  }

  sair(): void {
    storage.remove(STORAGE_KEYS.sessao)
  }
}

export class ClienteServiceMock implements ClienteService {
  async obter(id: number): Promise<Cliente> {
    await simularRede()
    const c = obterDb().clientes.find((x) => x.id === id)
    if (!c) throw new ErroNaoEncontrado('Cliente não encontrado.')
    return structuredClone(c)
  }

  async registrarConsentimento(clienteId: number): Promise<Cliente> {
    await simularRede()
    const db = obterDb()
    const c = db.clientes.find((x) => x.id === clienteId)
    if (!c) throw new ErroNaoEncontrado('Cliente não encontrado.')
    c.consentimentoLgpd = true
    c.dataConsentimento = agoraIso()
    if (!db.fidelidade.some((f) => f.clienteId === clienteId)) {
      db.fidelidade.push({ clienteId, pontos: 0, percentualDesconto: 0, frequenciaConsumo: 0, nivel: 'INICIANTE', pontosProximoNivel: 100, historico: [] })
    }
    salvarDb()
    const sessao = storage.get<Sessao | null>(STORAGE_KEYS.sessao, null)
    if (sessao?.cliente?.id === clienteId) storage.set(STORAGE_KEYS.sessao, { ...sessao, cliente: structuredClone(c) })
    return structuredClone(c)
  }

  async solicitarAnonimizacao(clienteId: number): Promise<void> {
    await simularRede()
    const db = obterDb()
    const c = db.clientes.find((x) => x.id === clienteId)
    if (!c) throw new ErroNaoEncontrado('Cliente não encontrado.')
    c.nome = 'Cliente anonimizado'
    c.email = `anonimo-${clienteId}@anonimizado.local`
    c.dataNascimento = null
    c.consentimentoLgpd = false
    c.anonimizado = true
    db.usuarios.forEach((u) => {
      if (u.clienteId === clienteId) u.ativo = false
    })
    salvarDb()
    storage.remove(STORAGE_KEYS.sessao)
  }
}

export function calcularNivel(pontos: number) {
  const niveis = REGRAS_FIDELIDADE.niveis
  let atual = niveis[0]
  for (const n of niveis) if (pontos >= n.minimo) atual = n
  const proximo = niveis.find((n) => n.minimo > pontos)
  return { nivel: atual.nivel, percentual: atual.percentual, pontosProximoNivel: proximo ? proximo.minimo : null }
}

export class FidelidadeServiceMock implements FidelidadeService {
  async consultar(clienteId: number): Promise<Fidelidade> {
    await simularRede()
    const db = obterDb()
    const cliente = db.clientes.find((c) => c.id === clienteId)
    if (!cliente) throw new ErroNaoEncontrado('Cliente não encontrado.')
    if (!cliente.consentimentoLgpd) {
      throw new ErroNegocio('O programa de fidelidade exige consentimento LGPD. Ative o consentimento para participar.')
    }
    const conta = db.fidelidade.find((f) => f.clienteId === clienteId)
    if (!conta) throw new ErroNaoEncontrado('Conta de fidelidade não encontrada.')
    const nivel = calcularNivel(conta.pontos)
    return structuredClone({ ...conta, nivel: nivel.nivel, percentualDesconto: nivel.percentual, pontosProximoNivel: nivel.pontosProximoNivel })
  }
}
