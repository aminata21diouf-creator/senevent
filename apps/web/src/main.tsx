import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initSupabase } from '@senevent/shared'
import './index.css'
import App from './App.tsx'

initSupabase(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)