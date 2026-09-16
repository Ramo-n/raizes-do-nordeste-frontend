import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ProductCard } from '@/components/cardapio/ProductCard'
import { Layout } from '@/components/layout/Layout'
import { PaymentStatus } from '@/components/pagamento/PaymentStatus'
import { ErroNaoAutenticado } from '@/services/errors'
import { AppProviders } from '@/store/AppProviders'
import { itemCardapio } from '@/test/helpers'
import { CarrinhoPage } from '@/pages/CarrinhoPage'

function comProviders(ui: React.ReactNode, opcoes?: { canal?: 'WEB' | 'APP' | 'TOTEM'; rota?: string }) {
  return render(
    <MemoryRouter initialEntries={[opcoes?.rota ?? '/']}>
      <AppProviders canalInicial={opcoes?.canal}>{ui}</AppProviders>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('Componentes de interface — formulários, estados e multicanal', () => {
  it('CT04 (UI) — login inválido: validação local exibe erros acessíveis e erro do serviço aparece em role="alert"', async () => {
    const user = userEvent.setup()
    const aoEntrar = vi.fn().mockRejectedValue(new ErroNaoAutenticado())
    render(<LoginForm aoEntrar={aoEntrar} />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))
    expect(aoEntrar).not.toHaveBeenCalled()
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByLabelText(/e-mail/i)).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByLabelText(/e-mail/i), 'maria@exemplo.com')
    await user.type(screen.getByLabelText(/^senha/i), 'errada1')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    expect(aoEntrar).toHaveBeenCalledWith({ email: 'maria@exemplo.com', senha: 'errada1' })
    expect(await screen.findByText(/e-mail ou senha inválidos/i)).toBeInTheDocument()
  })

  it('CT02 (UI) — cadastro inválido: sem consentimento LGPD o formulário não envia e informa o motivo', async () => {
    const user = userEvent.setup()
    const aoCadastrar = vi.fn().mockResolvedValue({})
    comProviders(<RegisterForm aoCadastrar={aoCadastrar} />)

    await user.type(screen.getByLabelText(/^nome/i), 'Ana Souza')
    await user.type(screen.getByLabelText(/^e-mail/i), 'ana@exemplo.com')
    await user.type(screen.getByLabelText(/^senha/i), 'segredo1')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'diferente')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(aoCadastrar).not.toHaveBeenCalled()
    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument()
    expect(screen.getByText(/é necessário aceitar a política de privacidade/i)).toBeInTheDocument()
    // LGPD visível no formulário: finalidade e minimização
    expect(screen.getAllByRole('link', { name: /política de privacidade/i }).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/data de nascimento \(opcional\)/i)).toBeInTheDocument()
  })

  it('CT01 (UI) — cadastro válido envia apenas os dados necessários com consentimento explícito', async () => {
    const user = userEvent.setup()
    const aoCadastrar = vi.fn().mockResolvedValue({})
    comProviders(<RegisterForm aoCadastrar={aoCadastrar} />)
    await user.type(screen.getByLabelText(/^nome/i), 'Ana Souza')
    await user.type(screen.getByLabelText(/^e-mail/i), 'ana@exemplo.com')
    await user.type(screen.getByLabelText(/^senha/i), 'segredo1')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'segredo1')
    await user.click(screen.getByLabelText(/li e aceito a política de privacidade/i))
    await user.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(aoCadastrar).toHaveBeenCalledTimes(1)
    expect(aoCadastrar.mock.calls[0][0]).toMatchObject({ nome: 'Ana Souza', email: 'ana@exemplo.com', consentimentoLgpd: true })
  })

  it('CT16 (UI) — produto indisponível: estado textual (não só cor) e botão desabilitado', () => {
    const aoAdicionar = vi.fn()
    comProviders(<ProductCard item={itemCardapio({ disponivel: false, motivoIndisponibilidade: 'Esgotado hoje' })} aoAdicionar={aoAdicionar} />)
    expect(screen.getByText('Indisponível', { selector: '.chip' })).toBeInTheDocument()
    const botao = screen.getByRole('button', { name: /indisponível/i })
    expect(botao).toBeDisabled()
  })

  it('CT08 (UI) — carrinho vazio: estado EMPTY orienta o usuário e não há botão de finalizar', () => {
    comProviders(<CarrinhoPage />, { rota: '/carrinho' })
    expect(screen.getByRole('heading', { name: /seu carrinho está vazio/i })).toBeInTheDocument()
    expect(screen.getByText(/não é possível finalizar um pedido sem itens/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /finalizar pedido/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir para o cardápio/i })).toBeInTheDocument()
  })

  it('CT10/CT11 (UI) — PaymentStatus comunica os estados do pagamento em texto com role de status/alerta', () => {
    const { rerender } = render(<PaymentStatus estado="PENDING" />)
    expect(screen.getByText(/processando pagamento/i)).toBeInTheDocument()
    rerender(<PaymentStatus estado="APPROVED" />)
    expect(screen.getByText(/pagamento aprovado/i)).toBeInTheDocument()
    rerender(<PaymentStatus estado="DECLINED" />)
    expect(screen.getByText(/pagamento recusado/i)).toBeInTheDocument()
    rerender(<PaymentStatus estado="ERROR" />)
    expect(screen.getByText(/erro ao processar pagamento/i)).toBeInTheDocument()
  })

  it('CT14 — multicanal/responsividade: APP exibe navegação inferior; TOTEM exibe barra de modo toque e oculta a navegação', () => {
    const arvore = (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>conteúdo</p>} />
        </Route>
      </Routes>
    )
    const app = comProviders(arvore, { canal: 'APP' })
    expect(screen.getByRole('navigation', { name: /navegação principal/i })).toBeInTheDocument()
    expect(document.documentElement.getAttribute('data-canal')).toBe('APP')
    app.unmount()

    comProviders(arvore, { canal: 'TOTEM' })
    expect(document.documentElement.getAttribute('data-canal')).toBe('TOTEM')
    expect(screen.queryByRole('navigation', { name: /navegação principal/i })).not.toBeInTheDocument()
    expect(within(screen.getByRole('status')).getByText(/modo totem/i)).toBeInTheDocument()
  })
})
