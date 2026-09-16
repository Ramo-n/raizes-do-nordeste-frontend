import { useState } from 'react'
import { LoyaltyCard } from '@/components/fidelidade/LoyaltyCard'
import { Alert, Button, ErrorState, LinkButton, LoadingState } from '@/components/ui'
import { REGRAS_FIDELIDADE } from '@/data/mock'
import { useAsync } from '@/hooks/useAsync'
import { ROTAS } from '@/routes/paths'
import { servicos } from '@/services'
import { paraAppError } from '@/services/errors'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/store/ToastContext'

/** UC07 — Fidelidade (RF11, RF12). Depende de consentimento LGPD (regra do Back-End). */
export function FidelidadePage() {
  const { sessao, autenticado, atualizarCliente } = useAuth()
  const { notificar } = useToast()
  const clienteId = sessao?.cliente?.id ?? null
  const consentiu = sessao?.cliente?.consentimentoLgpd ?? false
  const [ativando, setAtivando] = useState(false)

  const fid = useAsync(() => servicos.fidelidade.consultar(clienteId as number), [clienteId, consentiu], { habilitado: clienteId !== null && consentiu })

  const ativar = async () => {
    if (clienteId == null) return
    setAtivando(true)
    try {
      const c = await servicos.clientes.registrarConsentimento(clienteId)
      atualizarCliente(c)
      notificar('Consentimento registrado. Você agora participa do programa de fidelidade.', 'sucesso')
    } catch (e) {
      notificar(paraAppError(e).message, 'erro')
    } finally {
      setAtivando(false)
    }
  }

  return (
    <div className="container-estreito">
      <h1>Programa Raízes Fidelidade</h1>
      <p className="texto-suave">
        Ganhe {REGRAS_FIDELIDADE.pontosPorReal} ponto por real gasto e desbloqueie descontos automáticos de até {REGRAS_FIDELIDADE.niveis[REGRAS_FIDELIDADE.niveis.length - 1].percentual}%.
      </p>

      {!autenticado && (
        <div className="card">
          <Alert tipo="info" titulo="Entre para ver seus pontos">
            O programa é vinculado à sua conta. Entre ou cadastre-se para acumular pontos.
          </Alert>
          <div className="linha mt-4">
            <LinkButton to={ROTAS.login} variante="primario" state={{ de: ROTAS.fidelidade }}>
              Entrar
            </LinkButton>
            <LinkButton to={ROTAS.cadastro} variante="contorno" state={{ de: ROTAS.fidelidade }}>
              Criar conta
            </LinkButton>
          </div>
          <NiveisResumo />
        </div>
      )}

      {autenticado && clienteId == null && <Alert tipo="alerta">Sua conta é operacional ({sessao?.role}) e não participa do programa de fidelidade.</Alert>}

      {autenticado && clienteId != null && !consentiu && (
        <div className="card">
          <Alert tipo="alerta" titulo="Consentimento necessário (LGPD)">
            Para acumular pontos precisamos registrar seu histórico de pedidos. Esse tratamento é opcional e exige seu consentimento, que pode ser revogado a qualquer momento em “Meus
            dados”.
          </Alert>
          <div className="mt-4">
            <Button variante="primario" onClick={ativar} carregando={ativando}>
              Aceito e quero participar
            </Button>
          </div>
          <NiveisResumo />
        </div>
      )}

      {autenticado && clienteId != null && consentiu && (
        <>
          {fid.estado === 'loading' && <LoadingState mensagem="Consultando seus pontos..." />}
          {fid.estado === 'error' && <ErrorState erro={fid.erro} titulo="Não foi possível consultar a fidelidade" aoTentarNovamente={fid.recarregar} />}
          {fid.estado === 'success' && fid.dados && <LoyaltyCard fidelidade={fid.dados} />}
        </>
      )}
    </div>
  )
}

function NiveisResumo() {
  return (
    <ul className="niveis mt-4" aria-label="Níveis do programa">
      {REGRAS_FIDELIDADE.niveis.map((n) => (
        <li key={n.nivel} className="niveis__item">
          <strong>{n.nivel.charAt(0) + n.nivel.slice(1).toLowerCase()}</strong>
          <span className="texto-pequeno">{n.minimo}+ pts</span>
          <span className="texto-pequeno">{n.percentual}% off</span>
        </li>
      ))}
    </ul>
  )
}
