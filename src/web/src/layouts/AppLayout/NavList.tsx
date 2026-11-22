import { NavLink } from 'react-router'
import { Badge, Tooltip } from '@/design-system'
import { DESIGN_SYSTEM_ITEM, NAV_ITEMS } from '@/routes/navigation'
import styles from './NavList.module.css'

interface NavListProps {
  /** Barra contraída (solo iconos): el texto queda accesible pero oculto. */
  collapsed: boolean
  showDesignSystem: boolean
  onNavigate?: () => void
}

/** Lista de navegación compartida por la barra lateral y el cajón móvil. */
export function NavList({ collapsed, showDesignSystem, onNavigate }: NavListProps) {
  const items = showDesignSystem ? [...NAV_ITEMS, DESIGN_SYSTEM_ITEM] : NAV_ITEMS
  return (
    <ul className={styles.list} role="list">
      {items.map((item) => {
        const Icon = item.icon
        const provisional = item.status === 'provisional'
        const link = (
          <NavLink to={item.path} className={styles.link} onClick={onNavigate}>
            <Icon size={18} aria-hidden />
            <span className={collapsed ? 'sr-only' : styles.text}>{item.label}</span>
            {provisional ? collapsed ? <span className="sr-only"> (provisional)</span> : <Badge className={styles.tag}>Provisional</Badge> : null}
          </NavLink>
        )
        return <li key={item.id}>{collapsed ? <Tooltip content={provisional ? `${item.label} (provisional)` : item.label} side="right">{link}</Tooltip> : link}</li>
      })}
    </ul>
  )
}
