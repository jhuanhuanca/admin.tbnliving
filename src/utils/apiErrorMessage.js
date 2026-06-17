/**
 * Mensaje legible desde respuesta axios del API core.
 */
export function apiErrorMessage(err, fallback = 'Error de API') {
  const d = err?.response?.data

  if (d?.errors && typeof d.errors === 'object') {
    const first = Object.values(d.errors).flat().find(Boolean)
    if (first) return String(first)
  }

  if (d?.message) return d.message

  if (d?.code === 'migration_required') {
    return 'Falta migración en el servidor. Ejecute: php artisan migrate --force'
  }
  if (d?.code === 'storage_not_writable') {
    return 'El servidor no puede escribir en storage/. Contacte al administrador del hosting.'
  }

  if (!err?.response) {
    if (err?.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con la API. Si acabas de subir una imagen, verifica que el servidor tenga espacio y permisos en storage/.'
    }
    return err?.message || fallback
  }

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
