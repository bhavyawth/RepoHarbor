import { Route, Routes } from 'react-router-dom'
import Hero from './pages/LoginPage.tsx'
import ProtectedRoute from './components/ProtectedComponent.tsx'
function App() {
  return (
    <Routes>

      <Route 
        path="/" 
        element={<Hero />} 
      />

      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <div>Home Page</div>
          </ProtectedRoute>
        } 
      />
      
    </Routes>
  )
}

export default App
