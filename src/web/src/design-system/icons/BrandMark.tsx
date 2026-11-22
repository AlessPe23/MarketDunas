/** Marca provisional de MarketDunas (duna estilizada). No es un logotipo aprobado. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--color-action-bg)" />
      <path d="M6 20c3-5 6-5 10 0s7 5 10 0" fill="none" stroke="var(--color-action-fg)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
