import { Navigate, Route, Routes } from 'react-router-dom'
import Hero from './pages/HeroPage.tsx'
import AppLayout from './layouts/AppLayout.tsx'
import ProtectedRoute from './components/ProtectedComponent.tsx'
import { useAuth } from './features/auth/auth.hooks.ts'
import { Suspense, useEffect } from 'react'
import NewChat from './components/NewChat.tsx'
import ChatPage from './pages/ChatPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import AppLoader from './components/AppLoader.tsx'

function App() {
  const { data: user, isLoading: isAuthLoading } = useAuth();

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

  if (isAuthLoading && user === undefined) {
    return <AppLoader />;
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route element={<AppLayout />}>

            <Route
              path="/"
              element={(user) ? <Navigate to="/chat/new" replace /> : <Hero />}
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Navigate to="/chat/new" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat/new"
              element={
                <ProtectedRoute>
                  <NewChat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat/:chatId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
