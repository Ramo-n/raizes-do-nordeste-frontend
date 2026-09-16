import { Link } from 'react-router-dom'
import { env } from '@/config/env'
import { ROTAS } from '@/routes/paths'
import { ChannelSwitcher } from './ChannelSwitcher'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <h3>Rede Raízes do Nordeste</h3>
          <p>
            Sabores do Nordeste em unidades espalhadas pelo Brasil. Projeto acadêmico — Projeto Multidisciplinar, Trilha Front-End (2026). Nenhum pagamento real é
            processado.
          </p>
          <p className="texto-pequeno">
            Fonte de dados: <strong>{env.dataSource === 'api' ? 'Back-End (API)' : 'Mock Data local'}</strong>
          </p>
        </div>
        <div>
          <h3>Navegação</h3>
          <ul>
            <li>
              <Link to={ROTAS.unidades}>Unidades</Link>
            </li>
            <li>
              <Link to={ROTAS.cardapio}>Cardápio</Link>
            </li>
            <li>
              <Link to={ROTAS.promocoes}>Promoções</Link>
            </li>
            <li>
              <Link to={ROTAS.fidelidade}>Programa de fidelidade</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Privacidade</h3>
          <ul>
            <li>
              <Link to={ROTAS.privacidade}>Política de privacidade (LGPD)</Link>
            </li>
            <li>
              <Link to={ROTAS.conta}>Meus dados e consentimento</Link>
            </li>
          </ul>
          <p className="texto-pequeno" style={{ marginTop: 'var(--esp-3)' }}>
            Canal de atendimento:
          </p>
          <ChannelSwitcher />
        </div>
      </div>
    </footer>
  )
}
