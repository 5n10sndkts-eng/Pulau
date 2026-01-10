/**
 * QR Scanner Component
 * Story: 27.1 - Build QR Code Scanner Interface
 * 
 * Scans QR codes from traveler tickets for check-in
 */

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Camera, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QRScannerProps {
  onScan: (bookingId: string) => void
  onClose: () => void
  isOpen: boolean
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    scanningRef.current = false
  }

  const startQRScanning = () => {
    if (!videoRef.current || scanningRef.current) return

    scanningRef.current = true

    // Use canvas-based QR detection (simplified approach)
    // In production, would use html5-qrcode library
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const scanInterval = setInterval(() => {
      if (!videoRef.current || !scanningRef.current) {
        clearInterval(scanInterval)
        return
      }

      const video = videoRef.current

      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // In production, use a QR detection library here
        // For now, simulate scanning with a mock pattern
        detectQRCode(canvas, context)
      }
    }, 500) // Scan every 500ms

    return () => clearInterval(scanInterval)
  }

  const detectQRCode = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    // This is a placeholder for actual QR detection
    // In production, use a library like jsQR or zxing-js
    
    // Mock detection for demonstration
    // Would extract booking ID from actual QR code
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
                  {/* Corner markers */}
                  <div className="w-64 h-64 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                    
                    {/* Scanning line */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-white/50"
                      animate={{ y: [0, 256, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <p className="text-white text-center mt-4 text-sm">
                    Position QR code within frame
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
