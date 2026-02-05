import { Navigate, Route, Routes } from 'react-router-dom'
import Hero from './pages/HeroPage.tsx'
import AppLayout from './layouts/AppLayout.tsx'
import ProtectedRoute from './components/ProtectedComponent.tsx'
import { useAuth } from './features/auth/useAuth.ts'
import { useEffect } from 'react'

function App() {
  const { data: user, isLoading } = useAuth();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (theme) localStorage.setItem('theme', theme);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <Routes>
      <Route element={<AppLayout />}>

        <Route 
          path="/" 
          element={(user)?  <Navigate to="/app" replace /> : <Hero />} 
        />

        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <div>Home Page</div>
            </ProtectedRoute>
          } 
        />

        <Route
          path="/app/:repoId"
          element={
            <ProtectedRoute>
              <div>Home Page</div>
            </ProtectedRoute>
          }
        />
        
      </Route>
      </Routes>
    </div>
  )
}

export default App
