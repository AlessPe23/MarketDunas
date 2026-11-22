import { useState } from 'react'
import { Outlet } from 'react-router'
import { Badge, Dialog, IconButton, MEDIA } from '@/design-system'
import { BrandMark, Menu } from '@/design-system/icons'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { cx } from '@/shared/lib/cx'
import { NavList } from './NavList'
import styles from './AppLayout.module.css'

/**
 * Estructura general: barra lateral (232 px expandida / 56 px contraída), cabecera de 48 px y área de contenido
 * adaptable (máx. 1440 px). Por debajo de 768 px la navegación pasa a un cajón.
 */
export function AppLayout() {
  const regular = useMediaQuery(MEDIA.compact)
  const expanded = useMediaQuery(MEDIA.sidebarExpanded)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const showDesignSystem = import.meta.env.DEV

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#contenido">
        Saltar al contenido
      </a>

      {regular ? (
        <div className={cx(styles.sidebar, expanded ? styles.expanded : styles.collapsed)}>
          <div className={styles.brand}>
            <BrandMark />
            {expanded ? <span className={styles.brandName}>MarketDunas</span> : <span className="sr-only">MarketDunas</span>}
          </div>
          <nav aria-label="Principal">
            <NavList collapsed={!expanded} showDesignSystem={showDesignSystem} />
          </nav>
        </div>
      ) : null}

      <div className={styles.column}>
        <header className={styles.topbar}>
          {regular ? null : (
            <IconButton
              label="Abrir navegación"
              icon={<Menu size={18} />}
              onClick={() => {
                setDrawerOpen(true)
              }}
            />
          )}
          <p className={styles.crumbs}>MarketDunas</p>
          <Badge tone="info" className={styles.demoTag}>
            Prototipo · datos de demostración
          </Badge>
        </header>
        <main id="contenido" tabIndex={-1} className={styles.main}>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>

      {regular ? null : (
        <Dialog open={drawerOpen} onOpenChange={setDrawerOpen} variant="drawer" title="MarketDunas" description="Navegación principal">
          <nav aria-label="Principal">
            <NavList
              collapsed={false}
              showDesignSystem={showDesignSystem}
              onNavigate={() => {
                setDrawerOpen(false)
              }}
            />
          </nav>
        </Dialog>
      )}
    </div>
  )
}
