/** Etiquetas alineadas con CardCuenta.vue (test-front). */

export const WALLET_METHOD_LABELS = {
  USDT: 'USDT (TRC20)',
  BTC: 'Bitcoin',
  BANK: 'Transferencia bancaria',
}

export const WALLET_CURRENCY_LABELS = {
  BOB: 'Boliviano (BOB)',
  ARS: 'Peso argentino (ARS)',
  BRL: 'Real (BRL)',
  CLP: 'Peso chileno (CLP)',
  COP: 'Peso colombiano (COP)',
  CRC: 'Colón costarricense (CRC)',
  USD: 'Dólar estadounidense (USD)',
  EUR: 'Euro (EUR)',
  GTQ: 'Quetzal (GTQ)',
  HNL: 'Lempira (HNL)',
  MXN: 'Peso mexicano (MXN)',
  PAB: 'Balboa (PAB)',
  PEN: 'Sol (PEN)',
  PYG: 'Guaraní (PYG)',
  UYU: 'Peso uruguayo (UYU)',
  VES: 'Bolívar (VES)',
  DOP: 'Peso dominicano (DOP)',
  NIO: 'Córdoba (NIO)',
}

export function walletSettingsFromUser(user) {
  return user?.wallet_settings && typeof user.wallet_settings === 'object' ? user.wallet_settings : null
}

export function walletMethodLabel(method) {
  if (!method) return '—'
  return WALLET_METHOD_LABELS[method] || String(method)
}

export function walletCurrencyLabel(code) {
  if (!code) return '—'
  return WALLET_CURRENCY_LABELS[code] || String(code)
}

export function isBankWalletMethod(method) {
  return String(method || '').toUpperCase() === 'BANK'
}

export function walletSettingsConfigured(ws) {
  if (!ws) return false
  return Boolean(
    ws.method ||
      ws.currency ||
      ws.address ||
      ws.bank ||
      ws.holder ||
      ws.account ||
      ws.swift
  )
}

/** Resumen corto para tabla (método + dato clave). */
export function walletSettingsSummary(ws) {
  if (!walletSettingsConfigured(ws)) return 'Sin configurar'
  const method = walletMethodLabel(ws.method)
  if (isBankWalletMethod(ws.method)) {
    return [method, ws.bank, ws.account].filter(Boolean).join(' · ')
  }
  const addr = ws.address ? `${String(ws.address).slice(0, 10)}…` : ''
  return [method, addr].filter(Boolean).join(' · ')
}

/**
 * Filas para panel de detalle.
 * @returns {{ key: string, label: string, value: string, mono?: boolean, copy?: boolean }[]}
 */
export function walletSettingsDetailRows(ws) {
  if (!walletSettingsConfigured(ws)) return []

  const rows = [
    { key: 'method', label: 'Método de pago', value: walletMethodLabel(ws.method) },
    { key: 'currency', label: 'Moneda preferida', value: walletCurrencyLabel(ws.currency) },
  ]

  if (isBankWalletMethod(ws.method)) {
    if (ws.bank) rows.push({ key: 'bank', label: 'Banco', value: ws.bank })
    if (ws.holder) rows.push({ key: 'holder', label: 'Titular', value: ws.holder })
    if (ws.account) rows.push({ key: 'account', label: 'Cuenta / IBAN', value: ws.account, mono: true, copy: true })
    if (ws.swift) rows.push({ key: 'swift', label: 'SWIFT / BIC', value: ws.swift, mono: true, copy: true })
  } else if (ws.address) {
    rows.push({ key: 'address', label: 'Dirección / wallet', value: ws.address, mono: true, copy: true })
  }

  return rows
}

export function walletSettingsCopyText(ws) {
  const lines = walletSettingsDetailRows(ws).map((r) => `${r.label}: ${r.value}`)
  return lines.join('\n')
}
