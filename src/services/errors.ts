/**
 * Erros de aplicação. Toda a camada de serviços (mock ou API) lança apenas
 * subclasses de `AppError`, permitindo que a interface trate cada cenário
 * com mensagens claras (RNF09 — tratamento de erros).
 */

export type CodigoErro =
  | 'REDE'
  | 'TIMEOUT'
  | 'NAO_ENCONTRADO'
  | 'NAO_AUTENTICADO'
  | 'SEM_PERMISSAO'
  | 'VALIDACAO'
  | 'NEGOCIO'
  | 'DESCONHECIDO'

export class AppError extends Error {
  readonly codigo: CodigoErro
  readonly detalhes?: Record<string, string>

  constructor(codigo: CodigoErro, mensagem: string, detalhes?: Record<string, string>) {
    super(mensagem)
    this.name = 'AppError'
    this.codigo = codigo
    this.detalhes = detalhes
  }
}

export class ErroRede extends AppError {
  constructor(mensagem = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.') {
    super('REDE', mensagem)
    this.name = 'ErroRede'
  }
}

export class ErroTimeout extends AppError {
  constructor(mensagem = 'O serviço demorou demais para responder. Tente novamente.') {
    super('TIMEOUT', mensagem)
    this.name = 'ErroTimeout'
  }
}

export class ErroNaoEncontrado extends AppError {
  constructor(mensagem = 'Recurso não encontrado.') {
    super('NAO_ENCONTRADO', mensagem)
    this.name = 'ErroNaoEncontrado'
  }
}

export class ErroNaoAutenticado extends AppError {
  constructor(mensagem = 'E-mail ou senha inválidos.') {
    super('NAO_AUTENTICADO', mensagem)
    this.name = 'ErroNaoAutenticado'
  }
}

export class ErroValidacao extends AppError {
  constructor(mensagem = 'Dados inválidos.', detalhes?: Record<string, string>) {
    super('VALIDACAO', mensagem, detalhes)
    this.name = 'ErroValidacao'
  }
}

export class ErroNegocio extends AppError {
  constructor(mensagem: string) {
    super('NEGOCIO', mensagem)
    this.name = 'ErroNegocio'
  }
}

/** Converte qualquer valor lançado em `AppError`, preservando a mensagem quando possível. */
export function paraAppError(erro: unknown): AppError {
  if (erro instanceof AppError) return erro
  if (erro instanceof TypeError && /fetch|network/i.test(erro.message)) return new ErroRede()
  if (erro instanceof DOMException && erro.name === 'AbortError') return new ErroTimeout()
  const mensagem = erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado.'
  return new AppError('DESCONHECIDO', mensagem)
}
