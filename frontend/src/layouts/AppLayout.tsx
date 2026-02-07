// layouts/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/auth.hooks';
import Navbar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
export default function AppLayout() {
  const { data: user } = useAuth();

  const sidebarOpen = localStorage.getItem("sidebarOpen")

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <Outlet />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={sidebarOpen === "true"}>
      <div className="flex h-screen bg-white dark:bg-black">
        <SideBar /> 
        <SidebarInset>
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}