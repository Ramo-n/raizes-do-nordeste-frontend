import { useState } from 'react'
import { Link } from 'react-router-dom'
import { STORAGE_KEYS } from '@/config/env'
import { ROTAS } from '@/routes/paths'
import { Button } from '@/components/ui'
import { storage } from '@/utils/storage'

/**
 * Aviso de privacidade (LGPD, Fase 9). Informa de forma visível quais dados a aplicação
 * guarda no dispositivo e para qual finalidade. Não há cookies de rastreamento.
 */
export function PrivacyBanner() {
  const [visivel, setVisivel] = useState(() => !storage.get<boolean>(STORAGE_KEYS.consentimentoAviso, false))
  if (!visivel) return null

  const fechar = () => {
    storage.set(STORAGE_KEYS.consentimentoAviso, true)
    setVisivel(false)
  }

  return (
    <section className="banner-lgpd" role="region" aria-label="Aviso de privacidade">
      <p>
        <strong>Sua privacidade importa.</strong> Guardamos no seu dispositivo apenas a unidade escolhida, o carrinho e sua sessão de acesso, para que o pedido funcione.
        Não usamos cookies de rastreamento. <Link to={ROTAS.privacidade}>Saiba como tratamos seus dados</Link>.
      </p>
      <div className="banner-lgpd__acoes">
        <Button variante="secundario" onClick={fechar}>
          Entendi
        </Button>
      </div>
    </section>
  )
}
