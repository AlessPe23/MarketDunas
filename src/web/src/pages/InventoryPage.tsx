import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { InventoryScreen } from '@/features/inventory/InventoryScreen'

export function InventoryPage() {
  useDocumentTitle('Productos e inventario')
  return <InventoryScreen />
}
