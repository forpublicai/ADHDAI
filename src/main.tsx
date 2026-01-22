import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Agency from './pages/Agency'
import './index.css'

// Use HashRouter for GitHub Pages compatibility
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/agency" element={<Agency />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
