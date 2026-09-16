import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LoadingState } from '@/components/ui'
import { ROTAS } from './paths'
import { HomePage } from '@/pages/HomePage'
import { UnidadesPage } from '@/pages/UnidadesPage'
import { CardapioPage } from '@/pages/CardapioPage'
import { ProdutoPage } from '@/pages/ProdutoPage'
import { CarrinhoPage } from '@/pages/CarrinhoPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Telas fora do caminho crítico (RNF03): carregadas sob demanda.
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const CadastroPage = lazy(() => import('@/pages/CadastroPage').then((m) => ({ default: m.CadastroPage })))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const PagamentoPage = lazy(() => import('@/pages/PagamentoPage').then((m) => ({ default: m.PagamentoPage })))
const ConfirmacaoPage = lazy(() => import('@/pages/ConfirmacaoPage').then((m) => ({ default: m.ConfirmacaoPage })))
const AcompanhamentoPage = lazy(() => import('@/pages/AcompanhamentoPage').then((m) => ({ default: m.AcompanhamentoPage })))
const PedidosPage = lazy(() => import('@/pages/PedidosPage').then((m) => ({ default: m.PedidosPage })))
const FidelidadePage = lazy(() => import('@/pages/FidelidadePage').then((m) => ({ default: m.FidelidadePage })))
const PromocoesPage = lazy(() => import('@/pages/PromocoesPage').then((m) => ({ default: m.PromocoesPage })))
const PrivacidadePage = lazy(() => import('@/pages/PrivacidadePage').then((m) => ({ default: m.PrivacidadePage })))
const ContaPage = lazy(() => import('@/pages/ContaPage').then((m) => ({ default: m.ContaPage })))
const PainelPage = lazy(() => import('@/pages/PainelPage').then((m) => ({ default: m.PainelPage })))

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState mensagem="Carregando..." />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROTAS.inicio} element={<HomePage />} />
          <Route path={ROTAS.unidades} element={<UnidadesPage />} />
          <Route path={ROTAS.cardapio} element={<CardapioPage />} />
          <Route path={ROTAS.produto()} element={<ProdutoPage />} />
          <Route path={ROTAS.carrinho} element={<CarrinhoPage />} />
          <Route path={ROTAS.login} element={<LoginPage />} />
          <Route path={ROTAS.cadastro} element={<CadastroPage />} />
          <Route path={ROTAS.checkout} element={<CheckoutPage />} />
          <Route path={ROTAS.pagamento()} element={<PagamentoPage />} />
          <Route path={ROTAS.confirmacao()} element={<ConfirmacaoPage />} />
          <Route path={ROTAS.acompanhamento()} element={<AcompanhamentoPage />} />
          <Route path={ROTAS.pedidos} element={<PedidosPage />} />
          <Route path={ROTAS.fidelidade} element={<FidelidadePage />} />
          <Route path={ROTAS.promocoes} element={<PromocoesPage />} />
          <Route path={ROTAS.privacidade} element={<PrivacidadePage />} />
          <Route path={ROTAS.conta} element={<ContaPage />} />
          <Route path={ROTAS.painel} element={<PainelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
