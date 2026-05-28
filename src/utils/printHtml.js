/**
 * Impresión HTML en ventana emergente (Chrome / Edge / Firefox).
 *
 * IMPORTANTE: no usar `noopener` en window.open si necesitas document.write() o print().
 * Con noopener el navegador devuelve null y la pestaña queda en about:blank.
 */

const LOG_PREFIX = '[printHtml]'

/**
 * @param {import('axios').AxiosResponse} res
 * @returns {string}
 */
export function assertPrintHtmlResponse(res) {
  const status = res?.status
  const raw = res?.data

  if (status === 204) {
    throw new Error(
      'El servidor respondió sin contenido (HTTP 204). La ruta de impresión puede no estar desplegada.',
    )
  }

  return assertPrintHtmlContent(raw)
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function assertPrintHtmlContent(raw) {
  const text = raw == null ? '' : String(raw).trim()

  if (!text || text.length < 50) {
    throw new Error(
      'Documento vacío. Revisa que el pedido esté completado y que el backend devuelva HTML.',
    )
  }

  if (text.startsWith('{') || text.startsWith('[')) {
    let msg = 'El API devolvió JSON en lugar de HTML.'
    try {
      const json = JSON.parse(text)
      if (json?.message) msg = String(json.message)
    } catch {
      // ignore
    }
    throw new Error(msg)
  }

  if (!/<html/i.test(text) && !/<!doctype/i.test(text)) {
    throw new Error('La respuesta no es una página HTML válida para imprimir.')
  }

  return text
}

/**
 * Abre ventana en el mismo gesto de clic (evita bloqueo de popups).
 * Sin noopener para conservar la referencia al documento.
 *
 * @param {{ loadingMessage?: string }} [options]
 * @returns {Window | null}
 */
export function openPrintWindowSync(options = {}) {
  const loadingMessage = options.loadingMessage ?? 'Cargando documento…'

  // No usar 'noopener,noreferrer' — rompe document.write y deja about:blank
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    console.error(LOG_PREFIX, 'window.open devolvió null — popup bloqueado o no permitido')
    return null
  }

  try {
    printWindow.opener = null
  } catch {
    // ignore
  }

  const loadingHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Imprimir</title>
  <style>
    body { margin:0; font-family: system-ui, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; color:#64748b; }
  </style>
</head>
<body><p>${escapeHtml(loadingMessage)}</p></body>
</html>`

  printWindow.document.open('text/html', 'replace')
  printWindow.document.write(loadingHtml)
  printWindow.document.close()

  return printWindow
}

/**
 * Escribe HTML de impresión y lanza diálogo de impresión.
 *
 * @param {Window} printWindow
 * @param {string} html
 * @param {{ autoPrint?: boolean }} [options]
 */
export function writeHtmlToPrintWindow(printWindow, html, options = {}) {
  const { autoPrint = true } = options
  const content = assertPrintHtmlContent(html)

  if (!printWindow || printWindow.closed) {
    console.error(LOG_PREFIX, 'Ventana de impresión cerrada o inválida')
    throw new Error('La ventana de impresión se cerró antes de cargar el documento.')
  }

  printWindow.document.open('text/html', 'replace')
  printWindow.document.write(content)
  printWindow.document.close()

  if (autoPrint) {
    scheduleAutoPrint(printWindow)
  }
}

/**
 * Flujo completo post-fetch (sin ventana previa).
 *
 * @param {string} html
 */
export function openPrintHtml(html) {
  const printWindow = openPrintWindowSync({ loadingMessage: 'Preparando impresión…' })
  if (!printWindow) {
    throw new Error('El navegador bloqueó la ventana emergente. Permite popups para admin.tbnliving.com.')
  }
  writeHtmlToPrintWindow(printWindow, html)
}

/**
 * @param {Window} printWindow
 */
function scheduleAutoPrint(printWindow) {
  let done = false

  const runPrint = () => {
    if (done || !printWindow || printWindow.closed) return
    done = true
    try {
      printWindow.focus()
      printWindow.print()
    } catch (err) {
      console.error(LOG_PREFIX, 'window.print() falló', err)
    }
  }

  try {
    if (printWindow.document.readyState === 'complete') {
      setTimeout(runPrint, 300)
    } else {
      printWindow.addEventListener('load', () => setTimeout(runPrint, 300), { once: true })
    }
  } catch (err) {
    console.error(LOG_PREFIX, 'No se pudo registrar onload', err)
  }

  // Respaldo Chrome / Edge (document.write a veces no dispara load)
  setTimeout(runPrint, 900)
}

/**
 * @param {string} text
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
