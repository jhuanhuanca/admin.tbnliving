/** Etiquetas de líneas de pedido (producto / paquete) — alineado con InvoicePrintPresenter. */

export function orderItems(order) {
  return Array.isArray(order?.items) ? order.items : []
}

export function lineTypeLabel(item) {
  if (item?.package_id || item?.package) return 'Paquete'
  const meta = item?.meta && typeof item.meta === 'object' ? item.meta : {}
  if (meta.founder_package) return 'Paquete fundador'
  if (item?.product_id || item?.product) return 'Producto'
  return 'Ítem'
}

export function lineTypeBadgeClass(item) {
  const label = lineTypeLabel(item)
  if (label.includes('Paquete')) return 'badge badge-warn'
  if (label === 'Producto') return 'badge badge-success'
  return 'badge'
}

export function lineName(item) {
  if (item?.package?.name) return item.package.name
  if (item?.product?.name) return item.product.name
  const meta = item?.meta && typeof item.meta === 'object' ? item.meta : {}
  if (meta.label) return String(meta.label)
  if (meta.founder_package) return `Paquete Fundador (${meta.founder_package})`
  return `Línea #${item?.id ?? '?'}`
}

export function lineCode(item) {
  if (item?.product_id) return `PRD-${String(item.product_id).padStart(5, '0')}`
  if (item?.package_id) {
    const slug = item?.package?.slug
    return slug ? String(slug).toUpperCase() : `PKG-${item.package_id}`
  }
  const meta = item?.meta && typeof item.meta === 'object' ? item.meta : {}
  if (meta.founder_package) return `FND-${String(meta.founder_package).toUpperCase()}`
  return `LN-${item?.id ?? '?'}`
}

export function pickingSummaryFromItems(items) {
  const map = new Map()
  for (const item of items) {
    const name = lineName(item)
    const kind = lineTypeLabel(item)
    const key = `${kind}::${name}`
    const prev = map.get(key) || {
      name,
      kind,
      kindClass: lineTypeBadgeClass(item),
      qty: 0,
    }
    prev.qty += Number(item?.cantidad) || 0
    map.set(key, prev)
  }
  return [...map.values()].sort((a, b) => {
    const ka = a.kind.includes('Paquete') ? 0 : 1
    const kb = b.kind.includes('Paquete') ? 0 : 1
    if (ka !== kb) return ka - kb
    return a.name.localeCompare(b.name, 'es')
  })
}

export function orderItemsPreview(items, max = 2) {
  if (!items.length) return 'Sin ítems'
  const parts = items.slice(0, max).map((it) => {
    const qty = Number(it?.cantidad) || 1
    return `${lineName(it)} ×${qty}`
  })
  if (items.length > max) parts.push(`+${items.length - max} más`)
  return parts.join(' · ')
}
