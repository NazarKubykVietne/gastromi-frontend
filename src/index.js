import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import { GlobalStyle } from './styles/globalStyles'
import App from './App'

const container = document.getElementById('content')
if (!container) throw new Error('Root container #root not found')

createRoot(container).render(
  <BrowserRouter>
    <GlobalStyle />
    <App />
  </BrowserRouter>
)
