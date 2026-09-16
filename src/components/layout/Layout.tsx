import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PrivacyBanner } from '@/components/lgpd/PrivacyBanner'
import { Toasts } from '@/components/ui'
import { useChannel } from '@/store/ChannelContext'
import { Footer } from './Footer'
import { Header } from './Header'
import { Navigation } from './Navigation'
import { ChannelSwitcher } from './ChannelSwitcher'

export function Layout() {
  const { canal } = useChannel()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="app">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Header />
      {canal === 'TOTEM' && (
        <div className="totem-barra" role="status">
          <span>Modo Totem — toque nos botões para montar seu pedido</span>
          <ChannelSwitcher />
        </div>
      )}
      <main id="conteudo" className="app__main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      {canal !== 'TOTEM' && <Navigation />}
      <Toasts />
      <PrivacyBanner />
    </div>
  )
}
