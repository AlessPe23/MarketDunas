import type { CSSProperties } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  className?: string
}

/** Marcador visual de carga. Es decorativo (aria-hidden): el estado de carga se anuncia con LoadingState. */
export function Skeleton({ width = '100%', height = '0.75rem', className }: SkeletonProps) {
  return <span aria-hidden="true" className={cx(styles.skeleton, className)} style={{ width, height }} />
}
