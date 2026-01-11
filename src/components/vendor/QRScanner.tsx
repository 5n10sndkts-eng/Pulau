/**
 * QR Scanner Component
 * Story: 27.1 - Build QR Code Scanner Interface
 *
 * Scans QR codes from traveler tickets for check-in
 * Uses jsQR library for QR code detection from camera feed
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Camera, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (bookingId: string) => void
  onClose: () => void
  isOpen: boolean
}

// Expected QR data format: JSON with bookingId field or plain booking reference
interface QRData {
  bookingId?: string
  bookingReference?: string
  type?: 'pulau-ticket'
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)
  const scanIntervalRef = useRef<number | null>(null)

  // Parse QR code data and extract booking ID
  const parseQRData = useCallback((data: string): string | null => {
    // Try parsing as JSON first (structured ticket format)
    try {
      const parsed: QRData = JSON.parse(data)

      // Check for Pulau ticket format
      if (parsed.type === 'pulau-ticket') {
        return parsed.bookingId || parsed.bookingReference || null
      }

      // Fallback to any booking ID field
      return parsed.bookingId || parsed.bookingReference || null
    } catch {
      // Not JSON - treat as plain booking reference
      // Validate it looks like a booking reference (e.g., PUL-XXXXXX or UUID)
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const refPattern = /^PUL-[A-Z0-9]{6,}$/i

      if (uuidPattern.test(data) || refPattern.test(data)) {
        return data
      }

      // Allow any alphanumeric string of reasonable length as fallback
      if (/^[A-Za-z0-9-]{6,50}$/.test(data)) {
        return data
      }

      return null
    }
  }, [])

  // Handle successful QR scan
  const handleQRDetected = useCallback(
    (bookingId: string) => {
      // Prevent duplicate scans of same code
      if (bookingId === lastScannedCode) {
        return
      }

      setLastScannedCode(bookingId)
      setScanSuccess(true)

      // Stop scanning
      scanningRef.current = false
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
        scanIntervalRef.current = null
      }

      // Brief visual feedback then trigger callback
      setTimeout(() => {
        onScan(bookingId)
        onClose()
      }, 500)
    },
    [lastScannedCode, onScan, onClose]
  )

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      setScanSuccess(false)
      setLastScannedCode(null)
      return
    }

    startCamera()

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setError(null)
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      })

      streamRef.current = stream
      setHasPermission(true)

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Start scanning for QR codes
      startQRScanning()
    } catch (err) {
      console.error('Camera access error:', err)
      setHasPermission(false)
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access in your browser settings.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else {
          setError('Failed to access camera. Please try again.')
        }
      }
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    scanningRef.current = false
  }

  const startQRScanning = () => {
    if (!videoRef.current || scanningRef.current) return

    scanningRef.current = true

    // Create canvas for frame capture if not exists
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    const canvas = canvasRef.current
    const context = canvas.getContext('2d', { willReadFrequently: true })

    if (!context) {
      console.error('[QRScanner] Failed to get canvas context')
      return
    }

    // Scan at 10 FPS for balance between responsiveness and performance
    scanIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !scanningRef.current) {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current)
          scanIntervalRef.current = null
        }
        return
      }

      const video = videoRef.current

      // Only process when video has data
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        return
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for jsQR processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // Detect QR code using jsQR
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (qrCode && qrCode.data) {
        console.log('[QRScanner] QR code detected:', qrCode.data)

        // Parse and validate the QR data
        const bookingId = parseQRData(qrCode.data)

        if (bookingId) {
          handleQRDetected(bookingId)
        } else {
          console.warn('[QRScanner] Invalid QR data format:', qrCode.data)
        }
      }
    }, 100) // 100ms = 10 FPS
  }

  const handleManualInput = () => {
    const bookingId = prompt('Enter booking ID manually:')
    if (bookingId) {
      onScan(bookingId.trim())
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              <span className="font-semibold">Scan Ticket QR Code</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Feed */}
        <div className="absolute inset-0 flex items-center justify-center">
          {hasPermission === null && (
            <div className="text-white text-center">
              <div className="animate-pulse mb-4">
                <Camera className="w-16 h-16 mx-auto" />
              </div>
              <p>Requesting camera access...</p>
            </div>
          )}

          {hasPermission === false && error && (
            <Card className="m-4 p-6 max-w-md">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="mt-4 space-y-2">
                <Button onClick={startCamera} className="w-full">
                  Try Again
                </Button>
                <Button onClick={handleManualInput} variant="outline" className="w-full">
                  Enter Booking ID Manually
                </Button>
              </div>
            </Card>
          )}

          {hasPermission && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Corner markers - change color on success */}
                  <div className="w-64 h-64 relative">
                    <div
                      className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 transition-colors ${
                        scanSuccess ? 'border-green-400' : 'border-white'
                      }`}
                    ></div>
                    <div
                      className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 transition-colors ${
                        scanSuccess ? 'border-green-400' : 'border-white'
                      }`}
                    ></div>
                    <div
                      className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 transition-colors ${
                        scanSuccess ? 'border-green-400' : 'border-white'
                      }`}
                    ></div>
                    <div
                      className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 transition-colors ${
                        scanSuccess ? 'border-green-400' : 'border-white'
                      }`}
                    ></div>

                    {/* Success indicator or scanning line */}
                    {scanSuccess ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="bg-green-500 rounded-full p-4">
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="absolute left-0 right-0 h-1 bg-white/50"
                        animate={{ y: [0, 256, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    )}
                  </div>
                  <p className="text-white text-center mt-4 text-sm">
                    {scanSuccess
                      ? 'QR Code detected!'
                      : 'Position QR code within frame'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasPermission && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <Button
              onClick={handleManualInput}
              variant="outline"
              className="w-full bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              Enter Booking ID Manually
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
