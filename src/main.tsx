import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from 'react-router-dom'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { testSupabaseConnection } from '@/lib/supabase'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Test Supabase connection on app start (dev mode only)
if (import.meta.env.DEV) {
  testSupabaseConnection().then(({ connected, configured, error }) => {
    if (configured && !connected && error) {
      console.error('❌ Supabase connection failed:', error)
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </BrowserRouter>
)
