import { Link } from 'react-router'
import { EmptyState } from '@/design-system'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada')
  return (
    <>
      <h1>Página no encontrada</h1>
      <EmptyState title="Esta dirección no existe" description="Revisar la dirección o volver al inicio." action={<Link to="/inventario">Ir a Productos e inventario</Link>} />
    </>
  )
}
