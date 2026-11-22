import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Badge, Button, Checkbox, Dialog, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, EmptyState, ErrorState, IconButton, Input, LoadingState, Popover, SearchInput, Select, Skeleton, Tooltip, useToast } from '..'
import { AlertTriangle, CheckCircle2, MoreVertical, Plus } from '../icons'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import styles from './GalleryPage.module.css'

const COLOR_TOKENS = [
  '--color-bg-app',
  '--color-bg-surface',
  '--color-bg-subtle',
  '--color-bg-selected',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-muted',
  '--color-border-subtle',
  '--color-border-control',
  '--color-action-bg',
  '--color-action-bg-hover',
  '--color-action-bg-active',
  '--color-success-fg',
  '--color-warning-fg',
  '--color-danger-fg',
  '--color-info-fg',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
]
const SPACES = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-6', '--space-8', '--space-12']
const RADII = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg']

function Section({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId()
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      {children}
    </section>
  )
}

/** Galería del sistema de diseño (solo desarrollo): muestra tokens y componentes con sus estados. */
export function GalleryPage() {
  useDocumentTitle('Sistema de diseño')
  const { notify } = useToast()
  const [dialog, setDialog] = useState(false)
  return (
    <>
      <h1>Sistema de diseño «Duna»</h1>
      <p className={styles.lead}>Galería de referencia (solo desarrollo). La documentación está en DESIGN.md.</p>

      <Section title="Colores semánticos">
        <ul className={styles.swatches} role="list">
          {COLOR_TOKENS.map((token) => (
            <li key={token} className={styles.swatch}>
              <span className={styles.chip} style={{ background: `var(${token})` }} />
              <code>{token}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tipografía">
        <p className={styles.sansLarge}>Geist · Productos e inventario — áéíóú ñ ¿? ¡! 0123456789</p>
        <p className={styles.mono}>Geist Mono · DEMO-ACE-SOYA-1L-0001</p>
        <p className="num">Cifras tabulares: 1,284,000.500 · S/ 12,345,678.90</p>
      </Section>

      <Section title="Espaciado, radios y elevación">
        <div className={styles.row}>
          {SPACES.map((token) => (
            <div key={token} className={styles.space} style={{ width: `var(${token})` }} title={token} />
          ))}
        </div>
        <div className={styles.row}>
          {RADII.map((token) => (
            <div key={token} className={styles.radius} style={{ borderRadius: `var(${token})` }}>
              {token.replace('--radius-', '')}
            </div>
          ))}
          <div className={styles.elevation}>popover</div>
        </div>
      </Section>

      <Section title="Botones">
        <div className={styles.row}>
          <Button variant="primary" icon={<Plus size={16} />}>Primario</Button>
          <Button>Secundario</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="danger">Peligro</Button>
          <Button disabled>Deshabilitado</Button>
          <Button size="sm">Pequeño</Button>
          <IconButton label="Más acciones" icon={<MoreVertical size={16} />} />
        </div>
      </Section>

      <Section title="Formularios">
        <div className={styles.grid}>
          <Input label="Nombre" placeholder="Texto" hint="Ayuda breve." />
          <Input label="Con error" defaultValue="valor" error="Mensaje de error comprensible." />
          <SearchInput label="Buscar" placeholder="Buscar…" />
          <Select label="Selector">
            <option>Opción 1</option>
            <option>Opción 2</option>
          </Select>
          <Checkbox label="Casilla" showLabel />
          <Checkbox label="Mixta" showLabel indeterminate />
        </div>
      </Section>

      <Section title="Insignias (icono + texto)">
        <div className={styles.row}>
          <Badge tone="success" icon={<CheckCircle2 size={12} />}>Éxito</Badge>
          <Badge tone="warning" icon={<AlertTriangle size={12} />}>Advertencia</Badge>
          <Badge tone="danger">Error</Badge>
          <Badge tone="info">Información</Badge>
          <Badge>Neutro</Badge>
        </div>
      </Section>

      <Section title="Superposiciones">
        <div className={styles.row}>
          <Tooltip content="Texto de apoyo breve">
            <Button>Tooltip</Button>
          </Tooltip>
          <Popover trigger={<Button>Popover</Button>} label="Ejemplo de popover">
            <p>Contenido flotante no modal con controles.</p>
          </Popover>
          <DropdownMenu trigger={<Button>Menú</Button>} label="Ejemplo de menú">
            <DropdownMenuItem>Ver detalle</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem tone="danger">Desactivar</DropdownMenuItem>
          </DropdownMenu>
          <Button
            onClick={() => {
              setDialog(true)
            }}
          >
            Diálogo
          </Button>
          <Button
            onClick={() => {
              notify({ title: 'Notificación de ejemplo', description: 'Se anuncia de forma educada.' })
            }}
          >
            Notificación
          </Button>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog} title="Diálogo de ejemplo" description="Atrapa el foco y se cierra con Escape.">
          <p>Contenido del diálogo.</p>
        </Dialog>
      </Section>

      <Section title="Estados">
        <div className={styles.states}>
          <Skeleton width="12rem" />
          <LoadingState label="Cargando ejemplo" rows={2} />
          <EmptyState title="Sin resultados" description="Quitar filtros para ver todo." />
          <ErrorState title="No se pudo cargar" description="Reintentar en unos segundos." action={<Button variant="primary">Reintentar</Button>} />
        </div>
      </Section>
    </>
  )
}
