const BOB_FORMAT = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const BOB_COMPACT = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Formato monetario estándar del panel (bolivianos). */
export function formatBob(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return BOB_FORMAT.format(n)
}

/** Eje de gráficos: Bs. sin decimales en valores grandes. */
export function formatBobAxis(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return ''
  if (Math.abs(n) >= 1000) return BOB_COMPACT.format(n)
  return BOB_FORMAT.format(n)
}

export const BOB_CURRENCY = 'BOB'
export const BOB_LOCALE = 'es-BO'
