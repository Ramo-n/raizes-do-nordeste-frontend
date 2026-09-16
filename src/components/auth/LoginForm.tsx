import { useState, type FormEvent } from 'react'
import { Alert, Button, FormField } from '@/components/ui'
import { paraAppError } from '@/services/errors'
import type { CredenciaisLogin } from '@/types'
import { temErros, validarLogin, type CamposLogin, type ErrosFormulario } from '@/utils/validation'

interface LoginFormProps {
  aoEntrar: (credenciais: CredenciaisLogin) => Promise<unknown>
  aoSucesso?: () => void
}

/** UC02 — Autenticar Usuário (RF02). Validação local + erro do serviço em role="alert". */
export function LoginForm({ aoEntrar, aoSucesso }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState<ErrosFormulario<CamposLogin>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const submeter = async (e: FormEvent) => {
    e.preventDefault()
    setErroGeral(null)
    const v = validarLogin({ email, senha })
    setErros(v)
    if (temErros(v)) return
    setEnviando(true)
    try {
      await aoEntrar({ email: email.trim(), senha })
      aoSucesso?.()
    } catch (err) {
      setErroGeral(paraAppError(err).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={submeter} noValidate className="pilha" aria-label="Formulário de login" aria-busy={enviando}>
      {erroGeral && (
        <Alert tipo="erro" titulo="Não foi possível entrar">
          {erroGeral}
        </Alert>
      )}
      <FormField
        label="E-mail"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        erro={erros.email}
        obrigatorio
        ajuda="Usado apenas para identificar sua conta."
      />
      <FormField label="Senha" type="password" name="senha" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} erro={erros.senha} obrigatorio />
      <Button type="submit" variante="primario" tamanho="grande" bloco carregando={enviando}>
        Entrar
      </Button>
    </form>
  )
}
