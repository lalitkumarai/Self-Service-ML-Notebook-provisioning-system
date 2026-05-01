import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

/**
 * Configure axios base URL from environment variable.
 *
 * Local dev  → VITE_API_URL is empty → Vite proxy in vite.config.js handles /api and /auth
 * Production → VITE_API_URL = 'https://your-backend.railway.app' → axios calls absolute URLs
 */
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
