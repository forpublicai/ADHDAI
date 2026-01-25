import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Agency from './pages/Agency'
import Team from './pages/Team'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Use HashRouter for GitHub Pages compatibility
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('Mounting React app...');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
