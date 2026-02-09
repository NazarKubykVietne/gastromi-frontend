import React from 'react'
import { Routes, Route } from 'react-router'

import AvatarSession from 'pages/AvatarSession'

const App = () => {
  return (
    <Routes>
      <Route path="/live" element={<AvatarSession />} />
      <Route path="*" element={'no page'} />
    </Routes>
  )
}

export default App
