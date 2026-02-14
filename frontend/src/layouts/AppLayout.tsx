// layouts/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/auth.hooks';
import Navbar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { useChatStore } from '../store/chat.store';
export default function AppLayout() {
  const { data: user } = useAuth();
  const { activeChatId } = useChatStore();

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
      <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden">
        <SideBar />
        <SidebarInset className="flex flex-1 min-w-0">
          <div className="flex flex-col flex-1 min-h-0">
            {activeChatId && <Navbar />}
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>

  );
}