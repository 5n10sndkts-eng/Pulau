import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from 'react-router-dom'
import "@github/spark/spark"

// Initialize i18n before any components render
import '@/lib/i18n'

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { testSupabaseConnection } from '@/lib/supabase'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Test Supabase connection on app start (dev mode only)
if (import.meta.env.DEV) {
  testSupabaseConnection()
    .then(({ connected, configured, error }) => {
      if (configured && !connected && error) {
        console.error('❌ Supabase connection failed:', error)
      }
    })
    .catch((err) => {
      console.error('❌ Supabase connection test error:', err)
    })
}

// Register Service Worker for offline ticket access (Story 26.1)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope)
        
        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Check every hour
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error)
      })
  })
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html has <div id="root"></div>')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)
