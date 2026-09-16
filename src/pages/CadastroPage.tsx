import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ROTAS } from '@/routes/paths'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'

export function CadastroPage() {
  const { cadastrar, autenticado } = useAuth()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { de?: string } | null)?.de ?? ROTAS.inicio

  if (autenticado) return <Navigate to={destino} replace />

  return (
    <div className="container-estreito">
      <h1>Criar conta</h1>
      <p className="texto-suave">Leva menos de um minuto. Pedimos apenas o essencial.</p>
      <div className="card">
        <RegisterForm
          aoCadastrar={cadastrar}
          aoSucesso={() => {
            notificar('Conta criada com sucesso. Bem-vindo(a)!', 'sucesso')
            navigate(destino, { replace: true })
          }}
        />
      </div>
      <p className="texto-centro mt-4">
        Já tem conta? <Link to={ROTAS.login} state={{ de: destino }}>Entrar</Link>
      </p>
    </div>
  )
}
