import { Link, useLocation } from 'react-router'
import { EmptyState } from '@/design-system'
import { NAV_ITEMS } from '@/routes/navigation'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

/** Marcador de posición para secciones aún no implementadas. No presenta datos ni funcionalidad. */
export function ProvisionalPage() {
  const { pathname } = useLocation()
  const item = NAV_ITEMS.find((entry) => entry.path === pathname)
  const title = item?.label ?? 'Sección'
  useDocumentTitle(`${title} (provisional)`)
  return (
    <>
      <h1>{title}</h1>
      <EmptyState
        title="Sección provisional"
        description="Esta opción de navegación es un marcador de posición: todavía no está implementada ni definida en el alcance."
        action={<Link to="/inventario">Ir a Productos e inventario</Link>}
      />
    </>
  )
}
