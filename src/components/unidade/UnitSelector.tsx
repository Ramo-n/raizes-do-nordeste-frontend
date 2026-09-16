import { Chip } from '@/components/ui'
import type { Unidade } from '@/types'

const STATUS: Record<Unidade['statusOperacional'], { rotulo: string; tipo: 'sucesso' | 'alerta' | 'erro' }> = {
  ABERTA: { rotulo: 'Aberta', tipo: 'sucesso' },
  FECHADA: { rotulo: 'Fechada agora', tipo: 'alerta' },
  INDISPONIVEL: { rotulo: 'Temporariamente indisponível', tipo: 'erro' },
}

interface UnitCardProps {
  unidade: Unidade
  selecionada: boolean
  aoSelecionar: (u: Unidade) => void
}

export function UnitCard({ unidade, selecionada, aoSelecionar }: UnitCardProps) {
  const st = STATUS[unidade.statusOperacional]
  const bloqueada = unidade.statusOperacional !== 'ABERTA'
  return (
    <button
      type="button"
      className={['unidade', selecionada && 'unidade--selecionada'].filter(Boolean).join(' ')}
      onClick={() => aoSelecionar(unidade)}
      disabled={bloqueada}
      aria-pressed={selecionada}
      aria-describedby={`unidade-${unidade.id}-status`}
    >
      <div className="linha linha--entre">
        <h3 className="unidade__nome">{unidade.nome}</h3>
        <span id={`unidade-${unidade.id}-status`}>
          <Chip tipo={st.tipo}>{st.rotulo}</Chip>
        </span>
      </div>
      <p className="texto-suave texto-pequeno" style={{ margin: 0 }}>
        {unidade.endereco} · {unidade.cidade}/{unidade.uf}
      </p>
      <p className="texto-pequeno" style={{ margin: 0 }}>
        <span aria-hidden="true">🕒</span> {unidade.horarioFuncionamento.replace('-', ' às ')} · Cozinha {unidade.tipoCozinha === 'COMPLETA' ? 'completa' : 'reduzida'}
      </p>
      {bloqueada && (
        <p className="texto-pequeno" style={{ margin: 0, color: 'var(--cor-erro)', fontWeight: 600 }}>
          {unidade.statusOperacional === 'FECHADA' ? 'Fora do horário de funcionamento. Escolha outra unidade.' : 'Unidade sem atendimento no momento.'}
        </p>
      )}
      {selecionada && (
        <p className="texto-pequeno" style={{ margin: 0, fontWeight: 700 }}>
          ✓ Unidade selecionada
        </p>
      )}
    </button>
  )
}

interface UnitSelectorProps {
  unidades: Unidade[]
  selecionadaId: number | null
  aoSelecionar: (u: Unidade) => void
}

/** Lista de unidades com estados aberta/fechada/indisponível (UC03, fluxo alternativo 5). */
export function UnitSelector({ unidades, selecionadaId, aoSelecionar }: UnitSelectorProps) {
  return (
    <ul className="grade grade--2" aria-label="Unidades disponíveis">
      {unidades.map((u) => (
        <li key={u.id}>
          <UnitCard unidade={u} selecionada={u.id === selecionadaId} aoSelecionar={aoSelecionar} />
        </li>
      ))}
    </ul>
  )
}
