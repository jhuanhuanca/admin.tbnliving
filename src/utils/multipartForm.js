export function appendFormFields(form, payload) {
  Object.entries(payload).forEach(([key, val]) => {
    if (val == null || val === '') {
      return
    }
    form.append(key, String(val))
  })
}

export function buildMultipartBody(payload, fileField, file) {
  const form = new FormData()
  appendFormFields(form, payload)
  if (file) {
    form.append(fileField, file)
  }
  return form
}

/** POST + _method=PUT: PHP no procesa archivos en PUT multipart de forma fiable. */
export function buildMultipartUpdateBody(payload, fileField, file) {
  const form = buildMultipartBody(payload, fileField, file)
  form.append('_method', 'PUT')
  return form
}
