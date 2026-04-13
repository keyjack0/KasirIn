'use client'

import { useEffect, useCallback } from 'react'

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void
  enabled?: boolean
}

/**
 * Hook to capture barcode scanner input.
 * Most barcode scanners act as keyboard devices and send keystrokes ending with Enter.
 */
export function useBarcodeScanner({ onScan, enabled = true }: BarcodeScannerOptions) {
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Barcode scanners typically send characters rapidly ending with Enter
      // This is a simplified implementation - a full one would use timing
      if (e.key === 'Enter') {
        const activeEl = document.activeElement as HTMLInputElement
        if (activeEl?.dataset?.barcode === 'true') {
          const value = activeEl.value.trim()
          if (value) {
            onScan(value)
            activeEl.value = ''
            e.preventDefault()
          }
        }
      }
    },
    [onScan, enabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleKeydown])
}
