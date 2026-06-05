import { onUnmounted, ref } from 'vue'
import { adminService } from '@/services/api/adminService'
import { apiErrorMessage } from '@/utils/apiErrorMessage'

/**
 * Carga comprobante de pago (imagen/PDF) vía API autenticada y expone URL blob.
 */
export function useOrderPaymentProof() {
  const proofOpen = ref(false)
  const proofLoading = ref(false)
  const proofError = ref('')
  const proofBlobUrl = ref('')
  const proofMime = ref('')
  const proofOrderId = ref(null)
  const proofFileName = ref('')

  function revokeBlob() {
    if (proofBlobUrl.value) {
      URL.revokeObjectURL(proofBlobUrl.value)
      proofBlobUrl.value = ''
    }
  }

  function closeProof() {
    proofOpen.value = false
    proofError.value = ''
    proofMime.value = ''
    proofOrderId.value = null
    proofFileName.value = ''
    revokeBlob()
  }

  async function openProof(order) {
    if (!order?.id || !order?.has_payment_proof) return

    proofOrderId.value = order.id
    proofFileName.value = order.payment_proof_original_name || `comprobante-pedido-${order.id}`
    proofOpen.value = true
    proofLoading.value = true
    proofError.value = ''
    revokeBlob()

    try {
      const { blob, mime } = await adminService.fetchOrderPaymentProof(order.id)
      proofMime.value = mime
      proofBlobUrl.value = URL.createObjectURL(blob)
    } catch (err) {
      proofError.value = apiErrorMessage(err, 'No se pudo cargar el comprobante.')
    } finally {
      proofLoading.value = false
    }
  }

  onUnmounted(revokeBlob)

  return {
    proofOpen,
    proofLoading,
    proofError,
    proofBlobUrl,
    proofMime,
    proofOrderId,
    proofFileName,
    openProof,
    closeProof,
  }
}
