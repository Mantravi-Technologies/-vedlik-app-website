import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import VedlikShowcase from './VedlikShowcase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VedlikShowcase />
  </StrictMode>,
)
