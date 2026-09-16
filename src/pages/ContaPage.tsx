import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Alert, Button, Chip, Modal } from '@/components/ui'
import { env } from '@/config/env'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { paraAppError } from '@/services/errors'
import { useAuth } from '@/store/AuthContext'
import { useCart } from '@/store/CartContext'
import { useToast } from '@/store/ToastContext'
import { useUnit } from '@/store/UnitContext'
import { formatarData, formatarDataHora } from '@/utils/format'

/** Meus dados — direitos do titular (LGPD): acesso, consentimento, anonimização, encerrar sessão. */
export function ContaPage() {
  const { sessao, autenticado, sair, atualizarCliente } = useAuth()
  const { limpar } = useCart()
  const { limpar: limparUnidade } = useUnit()
  const { notificar } = useToast()
  const navigate = useNavigate()
  const [confirmarAnon, setConfirmarAnon] = useState(false)
  const [processando, setProcessando] = useState(false)

  if (!autenticado || !sessao) return <Navigate to={ROTAS.login} replace state={{ de: ROTAS.conta }} />
  const cliente = sessao.cliente

  const encerrar = () => {
    sair()
    notificar('Sessão encerrada.', 'info')
    navigate(ROTAS.inicio)
  }

  const ativarConsentimento = async () => {
    if (!cliente) return
    setProcessando(true)
    try {
      atualizarCliente(await servicos.clientes.registrarConsentimento(cliente.id))
      notificar('Consentimento registrado.', 'sucesso')
    } catch (e) {
      notificar(paraAppError(e).message, 'erro')
    } finally {
      setProcessando(false)
    }
  }

  const anonimizar = async () => {
    if (!cliente) return
    setProcessando(true)
    try {
      await servicos.clientes.solicitarAnonimizacao(cliente.id)
      sair()
      limpar()
      limparUnidade()
      setConfirmarAnon(false)
      notificar('Seus dados pessoais foram anonimizados e a sessão foi encerrada.', 'sucesso')
      navigate(ROTAS.inicio)
    } catch (e) {
      notificar(paraAppError(e).message, 'erro')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="container-estreito">
      <h1>Meus dados</h1>
      <p className="texto-suave">Transparência sobre o que guardamos e controle sobre seus dados (LGPD, art. 18).</p>

      <section className="card" aria-labelledby="dados-titulo">
        <div className="linha linha--entre">
          <h2 id="dados-titulo" className="card__titulo" style={{ margin: 0 }}>
            Dados armazenados
          </h2>
          <Chip tipo="info">{sessao.role}</Chip>
        </div>
        <dl className="lista-detalhes">
          <div className="linha linha--entre">
            <dt>E-mail</dt>
            <dd>{sessao.email}</dd>
          </div>
          {cliente && (
            <>
              <div className="linha linha--entre">
                <dt>Nome</dt>
                <dd>{cliente.nome}</dd>
              </div>
              <div className="linha linha--entre">
                <dt>Data de nascimento</dt>
                <dd>{cliente.dataNascimento ? formatarData(cliente.dataNascimento) : <span className="texto-suave">não informada</span>}</dd>
              </div>
              <div className="linha linha--entre">
                <dt>Consentimento fidelidade</dt>
                <dd>{cliente.consentimentoLgpd ? `Ativo desde ${cliente.dataConsentimento ? formatarDataHora(cliente.dataConsentimento) : '—'}` : 'Não concedido'}</dd>
              </div>
            </>
          )}
        </dl>
        <p className="texto-pequeno texto-suave">
          Finalidades e bases legais estão descritas na <Link to={ROTAS.privacidade}>Política de Privacidade</Link>.
        </p>
      </section>

      {cliente && (
        <section className="card mt-4" aria-labelledby="consent-titulo">
          <h2 id="consent-titulo" className="card__titulo">
            Programa de fidelidade
          </h2>
          {cliente.consentimentoLgpd ? (
            <>
              <Alert tipo="sucesso">Você participa do programa. Seu histórico de pedidos é usado apenas para calcular pontos e descontos.</Alert>
              <p className="texto-pequeno texto-suave">Para revogar o consentimento, utilize a anonimização abaixo (encerra a conta) ou contate o encarregado de dados.</p>
            </>
          ) : (
            <>
              <p>Você não participa do programa. Nenhum histórico de compras é associado ao seu perfil.</p>
              <Button variante="primario" onClick={ativarConsentimento} carregando={processando}>
                Conceder consentimento e participar
              </Button>
            </>
          )}
        </section>
      )}

      <section className="card mt-4" aria-labelledby="acoes-titulo">
        <h2 id="acoes-titulo" className="card__titulo">
          Ações
        </h2>
        <div className="linha">
          <Button variante="contorno" onClick={encerrar}>
            Encerrar sessão
          </Button>
          {cliente && (
            <Button variante="perigo" onClick={() => setConfirmarAnon(true)}>
              Anonimizar meus dados
            </Button>
          )}
        </div>
        <p className="texto-pequeno texto-suave mt-4">
          A anonimização substitui nome e e-mail por valores não identificáveis, remove a data de nascimento, revoga o consentimento e desativa o acesso. Pedidos passados permanecem
          sem identificação para fins fiscais.
        </p>
        {env.dataSource === 'mock' && <p className="texto-pequeno texto-suave">Ambiente acadêmico: a operação é aplicada aos dados simulados no navegador.</p>}
      </section>

      <Modal
        aberto={confirmarAnon}
        titulo="Anonimizar dados pessoais?"
        aoFechar={() => setConfirmarAnon(false)}
        acoes={
          <>
            <Button onClick={() => setConfirmarAnon(false)}>Cancelar</Button>
            <Button variante="perigo" onClick={anonimizar} carregando={processando}>
              Sim, anonimizar
            </Button>
          </>
        }
      >
        <p>Esta ação é irreversível: você perderá o acesso à conta e aos pontos de fidelidade acumulados.</p>
      </Modal>
    </div>
  )
}
