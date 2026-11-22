import { Button, SearchInput, Select } from '@/design-system'
import type { CategoryCount } from '../domain/query'
import { X } from '@/design-system/icons'
import styles from './InventoryToolbar.module.css'

interface InventoryToolbarProps {
  query: string
  supplier: string
  suppliers: readonly string[]
  categories: readonly CategoryCount[]
  categoryId: number | null
  disabled: boolean
  filtersActive: boolean
  onQueryChange: (value: string) => void
  onSupplierChange: (value: string) => void
  onCategoryChange: (categoryId: number | null) => void
  onClear: () => void
}

export function InventoryToolbar({ query, supplier, suppliers, categories, categoryId, disabled, filtersActive, onQueryChange, onSupplierChange, onCategoryChange, onClear }: InventoryToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <SearchInput
        className={styles.search}
        label="Buscar productos"
        placeholder="Buscar por nombre, código o proveedor"
        value={query}
        disabled={disabled}
        onChange={(event) => {
          onQueryChange(event.target.value)
        }}
      />
      <Select
        className={styles.supplier}
        label="Filtrar por proveedor"
        hideLabel
        value={supplier}
        disabled={disabled}
        onChange={(event) => {
          onSupplierChange(event.target.value)
        }}
      >
        <option value="">Todos los proveedores</option>
        {suppliers.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
      <Select
        className={styles.supplier}
        label="Filtrar por categoría"
        hideLabel
        value={categoryId === null ? '' : String(categoryId)}
        disabled={disabled}
        onChange={(event) => {
          onCategoryChange(event.target.value === '' ? null : Number(event.target.value))
        }}
      >
        <option value="">Todas las categorías</option>
        {categories.map((entry) =>
          entry.categoryId === null ? null : (
            <option key={entry.categoryId} value={entry.categoryId}>
              {entry.name} ({entry.count})
            </option>
          ),
        )}
      </Select>
      {filtersActive ? (
        <Button variant="ghost" icon={<X size={14} />} onClick={onClear}>
          Quitar filtros
        </Button>
      ) : null}
    </div>
  )
}
