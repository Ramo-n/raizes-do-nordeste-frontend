import { Link } from 'react-router-dom'
import { LinkButton } from '@/components/ui'
import { ROTAS } from '@/routes/paths'
import { useAuth } from '@/store/AuthContext'
import { useChannel } from '@/store/ChannelContext'
import { useUnit } from '@/store/UnitContext'

export function HomePage() {
  const { unidade } = useUnit()
  const { autenticado, sessao } = useAuth()
  const { canal } = useChannel()

  return (
    <div className="pilha" style={{ gap: 'var(--esp-6)' }}>
      <section className="hero" aria-labelledby="hero-titulo">
        <h1 id="hero-titulo">Sabores do Nordeste, pertinho de você</h1>
        <p>
          Tapioca, cuscuz, bolo de macaxeira e suco de cajá — feitos na hora em cada unidade da rede. Escolha sua unidade, monte o pedido e retire sem fila.
        </p>
        <div className="hero__acoes">
          <LinkButton to={unidade ? ROTAS.cardapio : ROTAS.unidades} variante="secundario" tamanho="grande">
            {unidade ? `Ver cardápio de ${unidade.nome.replace('Raízes ', '')}` : 'Começar pedido'}
          </LinkButton>
          {unidade && (
            <LinkButton to={ROTAS.unidades} variante="contorno" tamanho="grande" style={{ borderColor: '#fff', color: '#fff' }}>
              Trocar unidade
            </LinkButton>
          )}
        </div>
        {autenticado && (
          <p className="texto-pequeno" style={{ opacity: 0.9 }}>
            Olá, {sessao?.cliente?.nome ?? sessao?.email}! Seus pontos de fidelidade estão em <Link to={ROTAS.fidelidade} style={{ color: 'inherit' }}>Fidelidade</Link>.
          </p>
        )}
      </section>

      <section aria-labelledby="como-funciona">
        <h2 id="como-funciona">Como funciona</h2>
        <ol className="passos">
          <li className="passos__item">
            <div>
              <strong>Escolha a unidade</strong>
              <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
                Cada unidade tem seu cardápio, com variações regionais.
              </p>
            </div>
          </li>
          <li className="passos__item">
            <div>
              <strong>Monte seu pedido</strong>
              <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
                Navegue por categorias, veja detalhes e adicione ao carrinho.
              </p>
            </div>
          </li>
          <li className="passos__item">
            <div>
              <strong>Pague com segurança</strong>
              <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
                Pagamento por serviço externo simulado — sem dados reais de cartão.
              </p>
            </div>
          </li>
          <li className="passos__item">
            <div>
              <strong>Acompanhe e retire</strong>
              <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
                Veja o status em tempo real e retire com seu código.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {canal !== 'TOTEM' && (
        <section className="grade grade--2" aria-label="Benefícios">
          <Link to={ROTAS.fidelidade} className="card card--clicavel card--destaque" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="card__titulo">⭐ Programa Raízes Fidelidade</h3>
            <p className="texto-suave" style={{ margin: 0 }}>
              Ganhe 1 ponto por real gasto e descontos de até 15% nos próximos pedidos.
            </p>
          </Link>
          <Link to={ROTAS.promocoes} className="card card--clicavel" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 className="card__titulo">🏷️ Promoções da semana</h3>
            <p className="texto-suave" style={{ margin: 0 }}>
              Cupons de boas-vindas, combos de café da manhã e campanhas sazonais.
            </p>
          </Link>
        </section>
      )}
    </div>
  )
}
