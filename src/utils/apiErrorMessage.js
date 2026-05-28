/**
 * Mensaje legible desde respuesta axios del API core.
 */
export function apiErrorMessage(err, fallback = 'Error de API') {
  const d = err?.response?.data
  if (d?.message) return d.message
  if (d?.code === 'MLM_UNAUTHORIZED') {
    return 'Token MLM interno inválido. En el API core: INTERNAL_SYNC_TOKEN debe coincidir con el servicio interno.'
  }
  if (d?.code === 'MLM_TOKEN_MISSING') {
    return 'Falta configuración de token interno en el API core.'
  }
  if (d?.code === 'PANEL_AUTH_REQUIRED') {
    return 'Sesión expirada. Vuelve a iniciar sesión.'
  }
  return err?.message || fallback
}
