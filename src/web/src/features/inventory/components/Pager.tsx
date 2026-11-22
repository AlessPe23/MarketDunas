import { Button, IconButton, Select } from '@/design-system'
import { ChevronLeft, ChevronRight } from '@/design-system/icons'
import { cx } from '@/shared/lib/cx'
import { PAGE_SIZES } from '../hooks/useInventoryView'
import styles from './Pager.module.css'

interface PagerProps {
  page: number
  pageCount: number
  from: number
  to: number
  total: number
  pageSize: number
  disabled: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

/** Páginas visibles: primera, última y una ventana alrededor de la actual; los saltos se marcan con «…». */
function pageWindow(page: number, pageCount: number): (number | 'gap')[] {
  const numbers = new Set([1, pageCount, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pageCount))
  const sorted = [...numbers].sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((n, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined && n - previous > 1) result.push('gap')
    result.push(n)
  })
  return result
}

export function Pager({ page, pageCount, from, to, total, pageSize, disabled, onPageChange, onPageSizeChange }: PagerProps) {
  const nf = new Intl.NumberFormat('es-PE')
  return (
    <nav className={styles.pager} aria-label="Paginación de productos">
      <p className={cx(styles.status, 'num')}>
        {total === 0 ? 'Sin resultados' : `${nf.format(from)}–${nf.format(to)} de ${nf.format(total)} · Página ${nf.format(page)} de ${nf.format(pageCount)}`}
      </p>
      <div className={styles.controls}>
        <Select
          className={styles.size}
          label="Filas por página"
          value={String(pageSize)}
          disabled={disabled}
          onChange={(event) => {
            onPageSizeChange(Number(event.target.value))
          }}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
        <ul className={styles.pages} role="list">
          <li>
            <IconButton
              variant="secondary"
              label="Página anterior"
              icon={<ChevronLeft size={16} />}
              disabled={disabled || page <= 1}
              onClick={() => {
                onPageChange(page - 1)
              }}
            />
          </li>
          {pageWindow(page, pageCount).map((entry, index) =>
            entry === 'gap' ? (
              <li key={`gap-${index}`} aria-hidden="true" className={styles.gap}>
                …
              </li>
            ) : (
              <li key={entry}>
                <Button
                  variant={entry === page ? 'primary' : 'secondary'}
                  className={styles.pageButton}
                  aria-label={`Página ${entry}`}
                  aria-current={entry === page ? 'page' : undefined}
                  disabled={disabled}
                  onClick={() => {
                    onPageChange(entry)
                  }}
                >
                  {nf.format(entry)}
                </Button>
              </li>
            ),
          )}
          <li>
            <IconButton
              variant="secondary"
              label="Página siguiente"
              icon={<ChevronRight size={16} />}
              disabled={disabled || page >= pageCount}
              onClick={() => {
                onPageChange(page + 1)
              }}
            />
          </li>
        </ul>
      </div>
    </nav>
  )
}
