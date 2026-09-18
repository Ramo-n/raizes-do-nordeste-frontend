import { Link, NavLink } from 'react-router-dom'
import { ROTAS } from '@/routes/paths'
import { useAuth } from '@/store/AuthContext'
import { useCart } from '@/store/CartContext'
import { useChannel } from '@/store/ChannelContext'
import { useUnit } from '@/store/UnitContext'

const LINKS_WEB = [
  { para: ROTAS.cardapio, rotulo: 'Cardápio' },
  { para: ROTAS.promocoes, rotulo: 'Promoções' },
  { para: ROTAS.fidelidade, rotulo: 'Fidelidade' },
  { para: ROTAS.pedidos, rotulo: 'Meus pedidos' },
]

/** Cabeçalho fixo com marca, unidade atual, navegação (WEB) e acesso ao carrinho/conta. */
export function Header() {
  const { unidade } = useUnit()
  const { totalItens } = useCart()
  const { sessao, autenticado } = useAuth()
  const { canal } = useChannel()

  return (
    <header className="header">
      <div className="header__inner">
        <Link to={ROTAS.inicio} className="header__marca" aria-label="Raízes do Nordeste — página inicial">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={32} height={32} />
          <span>Raízes do Nordeste</span>
        </Link>

        <Link to={ROTAS.unidades} className="header__unidade" aria-label={unidade ? `Unidade atual: ${unidade.nome}. Trocar unidade` : 'Escolher unidade'}>
          <span aria-hidden="true">📍</span>
          <span>{unidade ? unidade.nome : 'Escolher unidade'}</span>
        </Link>

        <div className="header__espaco" />

        {canal === 'WEB' && (
          <nav className="header__nav" aria-label="Principal">
            {LINKS_WEB.map((l) => (
              <NavLink key={l.para} to={l.para} className="header__link">
                {l.rotulo}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="header__acoes">
          {canal !== 'TOTEM' && (
            <Link to={autenticado ? ROTAS.conta : ROTAS.login} className="header__icone" aria-label={autenticado ? `Minha conta (${sessao?.email})` : 'Entrar ou cadastrar'}>
              <span aria-hidden="true">{autenticado ? '👤' : '🔑'}</span>
            </Link>
          )}
          <Link to={ROTAS.carrinho} className="header__icone" aria-label={`Carrinho com ${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`}>
            <span aria-hidden="true">🛒</span>
            {totalItens > 0 && (
              <span className="badge-contador" aria-hidden="true">
                {totalItens}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
