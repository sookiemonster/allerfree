import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { HashRouter } from "react-router-dom";
import { ProfileProvider } from './contexts/ProfileContext.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </HashRouter>
  </StrictMode>,
)
