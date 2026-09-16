import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { env } from '@/config/env'
import { ROTAS } from '@/routes/paths'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'

export function LoginPage() {
  const { entrar, autenticado } = useAuth()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { de?: string } | null)?.de ?? ROTAS.inicio

  if (autenticado) return <Navigate to={destino} replace />

  return (
    <div className="container-estreito">
      <h1>Entrar</h1>
      <p className="texto-suave">Acesse sua conta para finalizar pedidos e acompanhar seus pontos.</p>
      <div className="card">
        <LoginForm
          aoEntrar={entrar}
          aoSucesso={() => {
            notificar('Login realizado com sucesso.', 'sucesso')
            navigate(destino, { replace: true })
          }}
        />
      </div>
      <p className="texto-centro mt-4">
        Ainda não tem conta? <Link to={ROTAS.cadastro} state={{ de: destino }}>Cadastre-se</Link>
      </p>
      {env.dataSource === 'mock' && (
        <details className="simulacao mt-4">
          <summary>Contas de demonstração (ambiente acadêmico)</summary>
          <p className="texto-pequeno">
            Cliente: <code>maria@exemplo.com</code> · Atendente: <code>atendente@raizes.com</code> · Gerente: <code>gerente@raizes.com</code>. Senha: <code>123456</code>.
          </p>
        </details>
      )}
    </div>
  )
}
