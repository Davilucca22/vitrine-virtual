import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Aplicacao from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Aplicacao />
  </StrictMode>,
)
