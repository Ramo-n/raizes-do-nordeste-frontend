import { HashRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes/AppRoutes'
import { AppProviders } from '@/store/AppProviders'

export function App() {
  return (
    <HashRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </HashRouter>
  )
}