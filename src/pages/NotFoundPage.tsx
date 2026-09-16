import { EmptyState, LinkButton } from '@/components/ui'
import { ROTAS } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <EmptyState
      titulo="Página não encontrada"
      descricao="O endereço acessado não existe ou foi movido."
      icone="🧭"
      acao={
        <LinkButton to={ROTAS.inicio} variante="primario">
          Voltar ao início
        </LinkButton>
      }
    />
  )
}
