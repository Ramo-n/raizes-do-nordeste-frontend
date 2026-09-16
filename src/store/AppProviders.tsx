import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { CartProvider } from './CartContext'
import { ChannelProvider } from './ChannelContext'
import { ToastProvider } from './ToastContext'
import { UnitProvider } from './UnitContext'
import type { CanalInterface } from '@/types'

export function AppProviders({ children, canalInicial }: { children: ReactNode; canalInicial?: CanalInterface }) {
  return (
    <ChannelProvider canalInicial={canalInicial}>
      <ToastProvider>
        <AuthProvider>
          <UnitProvider>
            <CartProvider>{children}</CartProvider>
          </UnitProvider>
        </AuthProvider>
      </ToastProvider>
    </ChannelProvider>
  )
}
