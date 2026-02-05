// layouts/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import Navbar from '../components/NavBar';
import SideBar from '../components/SideBar';

export default function AppLayout() {
  const { data: user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      <SideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}