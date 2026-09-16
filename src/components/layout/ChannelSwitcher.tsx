import { ROTULO_CANAL, useChannel } from '@/store/ChannelContext'
import type { CanalInterface } from '@/types'

const CANAIS: CanalInterface[] = ['WEB', 'APP', 'TOTEM']

/** Permite demonstrar a adaptação multicanal (Fase 8) sem depender do tamanho da janela. */
export function ChannelSwitcher() {
  const { canal, definirCanal, fixado, detectarAutomaticamente } = useChannel()
  return (
    <div className="linha">
      <div className="seletor-canal" role="group" aria-label="Canal de atendimento">
        {CANAIS.map((c) => (
          <button key={c} type="button" aria-pressed={canal === c} onClick={() => definirCanal(c)}>
            {ROTULO_CANAL[c]}
          </button>
        ))}
      </div>
      {fixado && (
        <button type="button" className="btn btn--fantasma btn--pequeno" onClick={detectarAutomaticamente}>
          Detectar automaticamente
        </button>
      )}
    </div>
  )
}
