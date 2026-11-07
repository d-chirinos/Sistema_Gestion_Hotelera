import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SupabaseApp from './SupabaseApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SupabaseApp />
  </StrictMode>,
)
