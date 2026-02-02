import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import './index.css'

// Lazy load heavy pages for code splitting
const Agency = lazy(() => import('./pages/Agency'))
const Team = lazy(() => import('./pages/Team'))

// Use HashRouter for GitHub Pages compatibility
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/agency" element={<Agency />} />
            <Route path="/team" element={<Team />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
