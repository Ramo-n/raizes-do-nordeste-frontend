/**
 * Validações de formulário (RF01/RF02 — fluxos alternativos "cadastro inválido" e "login inválido").
 * As mensagens são exibidas junto ao campo e anunciadas por leitores de tela (aria-describedby).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type ErrosFormulario<T extends string> = Partial<Record<T, string>>

export function validarEmail(email: string): string | undefined {
  const v = email.trim()
  if (!v) return 'Informe seu e-mail.'
  if (!EMAIL_RE.test(v)) return 'Informe um e-mail válido (ex.: nome@dominio.com).'
  return undefined
}

export function validarSenha(senha: string, minimo = 6): string | undefined {
  if (!senha) return 'Informe sua senha.'
  if (senha.length < minimo) return `A senha deve ter pelo menos ${minimo} caracteres.`
  return undefined
}

export function validarNome(nome: string): string | undefined {
  const v = nome.trim()
  if (!v) return 'Informe seu nome.'
  if (v.length < 3) return 'O nome deve ter pelo menos 3 caracteres.'
  return undefined
}

export function validarConfirmacaoSenha(senha: string, confirmacao: string): string | undefined {
  if (!confirmacao) return 'Confirme sua senha.'
  if (senha !== confirmacao) return 'As senhas não coincidem.'
  return undefined
}

export function validarConsentimento(aceito: boolean): string | undefined {
  return aceito ? undefined : 'É necessário aceitar a Política de Privacidade para criar a conta.'
}

export type CamposLogin = 'email' | 'senha'
export function validarLogin(d: { email: string; senha: string }): ErrosFormulario<CamposLogin> {
  const erros: ErrosFormulario<CamposLogin> = {}
  const e = validarEmail(d.email)
  const s = validarSenha(d.senha, 1)
  if (e) erros.email = e
  if (s) erros.senha = s
  return erros
}

export type CamposCadastro = 'nome' | 'email' | 'senha' | 'confirmacao' | 'consentimento'
export function validarCadastro(d: {
  nome: string
  email: string
  senha: string
  confirmacao: string
  consentimento: boolean
}): ErrosFormulario<CamposCadastro> {
  const erros: ErrosFormulario<CamposCadastro> = {}
  const n = validarNome(d.nome)
  const e = validarEmail(d.email)
  const s = validarSenha(d.senha)
  const c = validarConfirmacaoSenha(d.senha, d.confirmacao)
  const k = validarConsentimento(d.consentimento)
  if (n) erros.nome = n
  if (e) erros.email = e
  if (s) erros.senha = s
  if (c) erros.confirmacao = c
  if (k) erros.consentimento = k
  return erros
}

export function temErros(erros: Record<string, string | undefined>): boolean {
  return Object.values(erros).some(Boolean)
}
