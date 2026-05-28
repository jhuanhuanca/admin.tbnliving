import { ref } from 'vue'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import {
  openPrintWindowSync,
  writeHtmlToPrintWindow,
} from '@/utils/printHtml'

const LOG_PREFIX = '[usePrintDocument]'

/**
 * Impresión HTML/PDF vía ventana emergente + document.write (Vue 3).
 */
export function usePrintDocument() {
  const printing = ref(false)

  /**
   * @param {() => Promise<string>} fetchHtml
   * @param {{ loadingMessage?: string, onError?: (message: string) => void }} [options]
   * @returns {Promise<boolean>}
   */
  async function printFromFetch(fetchHtml, options = {}) {
    const { loadingMessage = 'Cargando documento…', onError } = options

    printing.value = true

    const printWindow = openPrintWindowSync({ loadingMessage })
    if (!printWindow) {
      const msg =
        'El navegador bloqueó la ventana emergente. Permite popups para admin.tbnliving.com e intenta de nuevo.'
      console.error(LOG_PREFIX, msg)
      onError?.(msg)
      printing.value = false
      return false
    }

    try {
      const html = await fetchHtml()
      writeHtmlToPrintWindow(printWindow, html)
      return true
    } catch (err) {
      console.error(LOG_PREFIX, 'Error al imprimir', err)
      try {
        printWindow.close()
      } catch {
        // ignore
      }
      onError?.(apiErrorMessage(err, 'No se pudo generar la impresión.'))
      return false
    } finally {
      printing.value = false
    }
  }

  return {
    printing,
    printFromFetch,
  }
}
