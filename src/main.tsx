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
