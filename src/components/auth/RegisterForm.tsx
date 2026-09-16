import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, CheckboxField, FormField } from '@/components/ui'
import { ROTAS } from '@/routes/paths'
import { paraAppError } from '@/services/errors'
import type { NovoCliente } from '@/types'
import { temErros, validarCadastro, type CamposCadastro, type ErrosFormulario } from '@/utils/validation'

interface RegisterFormProps {
  aoCadastrar: (dados: NovoCliente) => Promise<unknown>
  aoSucesso?: () => void
}

/**
 * UC01 — Cadastrar Cliente (RF01). Coleta mínima (LGPD): nome, e-mail e senha.
 * Data de nascimento é opcional e tem finalidade explícita. Consentimento é destacado e obrigatório.
 */
export function RegisterForm({ aoCadastrar, aoSucesso }: RegisterFormProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [fidelidade, setFidelidade] = useState(true)
  const [erros, setErros] = useState<ErrosFormulario<CamposCadastro>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const submeter = async (e: FormEvent) => {
    e.preventDefault()
    setErroGeral(null)
    const v = validarCadastro({ nome, email, senha, confirmacao, consentimento })
    setErros(v)
    if (temErros(v)) return
    setEnviando(true)
    try {
      await aoCadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        dataNascimento: dataNascimento || null,
        // Consentimento específico para o programa de fidelidade (finalidade distinta).
        consentimentoLgpd: consentimento && fidelidade,
      })
      aoSucesso?.()
    } catch (err) {
      setErroGeral(paraAppError(err).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={submeter} noValidate className="pilha" aria-label="Formulário de cadastro" aria-busy={enviando}>
      {erroGeral && (
        <Alert tipo="erro" titulo="Não foi possível concluir o cadastro">
          {erroGeral}
        </Alert>
      )}
      <Alert tipo="info" titulo="Coletamos apenas o necessário">
        <p>
          Nome e e-mail identificam seu pedido e sua conta. A senha protege o acesso. Nenhum dado financeiro é solicitado. Veja a{' '}
          <Link to={ROTAS.privacidade}>Política de Privacidade</Link>.
        </p>
      </Alert>

      <FormField label="Nome" name="nome" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} erro={erros.nome} obrigatorio ajuda="Como devemos te chamar na retirada do pedido." />
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
        ajuda="Para acessar sua conta e receber a confirmação do pedido."
      />
      <FormField
        label="Senha"
        type="password"
        name="senha"
        autoComplete="new-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        erro={erros.senha}
        obrigatorio
        ajuda="Mínimo de 6 caracteres."
      />
      <FormField label="Confirmar senha" type="password" name="confirmacao" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} erro={erros.confirmacao} obrigatorio />
      <FormField
        label="Data de nascimento (opcional)"
        type="date"
        name="dataNascimento"
        autoComplete="bday"
        value={dataNascimento}
        onChange={(e) => setDataNascimento(e.target.value)}
        ajuda="Finalidade: ofertas de aniversário no programa de fidelidade. Você pode deixar em branco."
      />

      <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="pilha">
        <legend className="campo__label" style={{ marginBottom: 'var(--esp-2)' }}>
          Privacidade e consentimento
        </legend>
        <CheckboxField
          name="consentimento"
          checked={consentimento}
          onChange={(e) => setConsentimento(e.target.checked)}
          erro={erros.consentimento}
          label={
            <>
              Li e aceito a <Link to={ROTAS.privacidade}>Política de Privacidade</Link> e autorizo o uso de nome e e-mail para criar minha conta e processar meus pedidos.{' '}
              <strong>(obrigatório)</strong>
            </>
          }
        />
        <CheckboxField
          name="fidelidade"
          checked={fidelidade}
          onChange={(e) => setFidelidade(e.target.checked)}
          label={
            <>
              Quero participar do <strong>Programa Raízes Fidelidade</strong>: autorizo o registro do histórico de compras para acumular pontos e receber descontos. (opcional
              — você pode revogar a qualquer momento em “Meus dados”)
            </>
          }
        />
      </fieldset>

      <Button type="submit" variante="primario" tamanho="grande" bloco carregando={enviando}>
        Criar conta
      </Button>
    </form>
  )
}
