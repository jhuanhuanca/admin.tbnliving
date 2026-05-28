/**
 * Limpia panel/dist antes del build (Windows: evita ENOTEMPTY de Vite).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function cleanDist() {
  if (!fs.existsSync(distDir)) {
    return
  }

  const attempts = 5
  for (let i = 0; i < attempts; i++) {
    try {
      fs.rmSync(distDir, {
        recursive: true,
        force: true,
        maxRetries: 5,
        retryDelay: 150,
      })
      return
    } catch (err) {
      if (i === attempts - 1) {
        console.error('\n[clean-dist] No se pudo borrar panel/dist.')
        console.error('Cierra: vite preview, el explorador de archivos en dist/, o el antivirus.')
        console.error(err?.message || err)
        process.exit(1)
      }
      await sleep(250 * (i + 1))
    }
  }
}

await cleanDist()
