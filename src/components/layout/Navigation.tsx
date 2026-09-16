import { NavLink } from 'react-router-dom'
import { ROTAS } from '@/routes/paths'
import { useCart } from '@/store/CartContext'

const ITENS = [
  { para: ROTAS.inicio, rotulo: 'Início', icone: '🏠', fim: true },
  { para: ROTAS.cardapio, rotulo: 'Cardápio', icone: '🍽️' },
  { para: ROTAS.carrinho, rotulo: 'Carrinho', icone: '🛒' },
  { para: ROTAS.pedidos, rotulo: 'Pedidos', icone: '🧾' },
  { para: ROTAS.fidelidade, rotulo: 'Fidelidade', icone: '⭐' },
]

/** Navegação inferior (APP / telas pequenas) — alvos de toque ≥ 56px. */
export function Navigation() {
  const { totalItens } = useCart()
  return (
    <nav className="nav-inferior" aria-label="Navegação principal">
      {ITENS.map((i) => (
        <NavLink key={i.para} to={i.para} end={i.fim} className="nav-inferior__item">
          <span className="nav-inferior__icone" aria-hidden="true">
            {i.icone}
          </span>
          <span>{i.rotulo}</span>
          {i.para === ROTAS.carrinho && totalItens > 0 && (
            <span className="badge-contador" aria-label={`${totalItens} itens`}>
              {totalItens}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
