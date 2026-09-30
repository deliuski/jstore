/**
 * AI background removal running entirely in the browser (@imgly/background-removal).
 * The library and its ~80 MB model are fetched from the IMG.LY CDN on first use
 * (cached by the browser afterwards), so they are only loaded when actually needed.
 */
export async function stripImageBackground(file: File, onProgress?: (note: string) => void): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal')
  return removeBackground(file, {
    // Uses WebGPU when available, falls back to WASM/CPU otherwise.
    device: 'gpu',
    progress: (key, current, total) => {
      const percent = total > 0 ? Math.round((current / total) * 100) : 0
      onProgress?.(key.startsWith('fetch') ? `Модель татаж байна… ${percent}%` : `Боловсруулж байна… ${percent}%`)
    },
  })
}
