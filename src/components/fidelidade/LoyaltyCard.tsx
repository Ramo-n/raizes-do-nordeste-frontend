import { Chip } from '@/components/ui'
import { REGRAS_FIDELIDADE } from '@/data/mock'
import type { Fidelidade } from '@/types'
import { formatarData } from '@/utils/format'

const ROTULO_NIVEL: Record<Fidelidade['nivel'], string> = { INICIANTE: 'Iniciante', BRONZE: 'Bronze', PRATA: 'Prata', OURO: 'Ouro' }

interface LoyaltyCardProps {
  fidelidade: Fidelidade
  compacto?: boolean
}

/** RF11/RF12 — pontos, nível, desconto atual e progresso para o próximo nível. */
export function LoyaltyCard({ fidelidade, compacto = false }: LoyaltyCardProps) {
  const niveis = REGRAS_FIDELIDADE.niveis
  const atual = niveis.find((n) => n.nivel === fidelidade.nivel) ?? niveis[0]
  const proximo = fidelidade.pontosProximoNivel
  const faixa = proximo != null ? proximo - atual.minimo : 1
  const progresso = proximo != null ? Math.min(100, Math.round(((fidelidade.pontos - atual.minimo) / faixa) * 100)) : 100

  return (
    <section className="fidelidade" aria-labelledby="fid-titulo">
      <div className="linha linha--entre">
        <h2 id="fid-titulo" className="card__titulo" style={{ margin: 0 }}>
          ⭐ Raízes Fidelidade
        </h2>
        <Chip tipo={fidelidade.nivel === 'OURO' ? 'ouro' : 'primario'}>Nível {ROTULO_NIVEL[fidelidade.nivel]}</Chip>
      </div>
      <p className="fidelidade__pontos">
        {fidelidade.pontos} <span className="texto-pequeno">pontos</span>
      </p>
      <p style={{ margin: 0 }}>
        Desconto atual: <strong>{fidelidade.percentualDesconto}%</strong> em todos os pedidos.
      </p>
      <div
        className="progresso"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progresso}
        aria-label={proximo != null ? `Progresso para o próximo nível: ${progresso}%` : 'Nível máximo atingido'}
      >
        <div className="progresso__barra" style={{ width: `${progresso}%` }} />
      </div>
      <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
        {proximo != null ? `Faltam ${proximo - fidelidade.pontos} pontos para o próximo nível.` : 'Você está no nível máximo!'}
      </p>

      {!compacto && (
        <>
          <h3 style={{ marginBottom: 'var(--esp-2)' }}>Níveis do programa</h3>
          <ul className="niveis">
            {niveis.map((n) => (
              <li key={n.nivel} className={`niveis__item ${n.nivel === fidelidade.nivel ? 'niveis__item--atual' : ''}`} aria-current={n.nivel === fidelidade.nivel ? 'true' : undefined}>
                <strong>{ROTULO_NIVEL[n.nivel]}</strong>
                <span className="texto-pequeno">{n.minimo}+ pts</span>
                <span className="texto-pequeno">{n.percentual}% off</span>
              </li>
            ))}
          </ul>
          <p className="texto-pequeno texto-suave">Regra: {REGRAS_FIDELIDADE.pontosPorReal} ponto por real gasto em pedidos pagos. Frequência: {fidelidade.frequenciaConsumo} pedidos.</p>

          <h3 style={{ marginBottom: 'var(--esp-2)' }}>Histórico</h3>
          {fidelidade.historico.length === 0 ? (
            <p className="texto-suave">Nenhum movimento ainda. Faça seu primeiro pedido para começar a pontuar.</p>
          ) : (
            <ul className="lista-detalhes" aria-label="Histórico de pontos">
              {fidelidade.historico.map((m) => (
                <li key={m.id} className="linha linha--entre">
                  <span>
                    {m.descricao} <span className="texto-pequeno texto-suave">· {formatarData(m.data)}</span>
                  </span>
                  <strong style={{ color: m.pontos >= 0 ? 'var(--cor-sucesso)' : 'var(--cor-erro)' }}>
                    {m.pontos >= 0 ? '+' : ''}
                    {m.pontos}
                  </strong>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
