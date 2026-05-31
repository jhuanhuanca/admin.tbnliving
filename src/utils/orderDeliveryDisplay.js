/** Etiquetas de entrega en pedidos (alineado con checkout socio / cliente preferente). */

export const DELIVERY_MODE_PICKUP = 'recojo'
export const DELIVERY_MODE_SHIPPING = 'envio'

export function deliveryModeLabel(mode) {
  if (mode === DELIVERY_MODE_SHIPPING) return 'Envío a domicilio'
  if (mode === DELIVERY_MODE_PICKUP || mode == null || mode === '') return 'Recojo personal'
  return String(mode)
}

export function deliveryModeBadgeClass(mode) {
  if (mode === DELIVERY_MODE_SHIPPING) return 'badge badge-warn'
  return 'badge badge-success'
}

export function hasShippingAddress(order) {
  return Boolean(
    String(order?.shipping_departamento || '').trim() ||
      String(order?.shipping_ciudad || '').trim() ||
      String(order?.shipping_direccion || '').trim()
  )
}

export function isShippingOrder(order) {
  return order?.delivery_mode === DELIVERY_MODE_SHIPPING || hasShippingAddress(order)
}

export function isLocalDelivery(departamento, ciudad = '') {
  const norm = (s) =>
    String(s || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  const dep = norm(departamento)
  const city = norm(ciudad)
  if (dep.includes('santa cruz')) return true
  if (city.includes('santa cruz')) return true
  return false
}

export function deliveryNoticeFor(order) {
  if (!isShippingOrder(order)) {
    return 'Recojo personal: coordinar entrega con el cliente o patrocinador.'
  }
  return isLocalDelivery(order?.shipping_departamento, order?.shipping_ciudad)
    ? 'Entrega local (Santa Cruz): plazo estimado 24 horas hábiles.'
    : 'Entrega nacional: plazo estimado 48 a 72 horas hábiles.'
}

export function deliverySummaryShort(order) {
  if (!isShippingOrder(order)) return 'Recojo personal'
  const parts = [
    order?.shipping_ciudad,
    order?.shipping_departamento,
  ]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
  return parts.length ? parts.join(', ') : 'Envío a domicilio'
}

export function shippingCostAmount(order) {
  const n = Number(order?.shipping_cost)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function orderSubtotalBeforeShipping(order) {
  const total = Number(order?.total)
  const shipping = shippingCostAmount(order)
  if (!Number.isFinite(total)) return null
  return Math.max(0, Math.round((total - shipping) * 100) / 100)
}
