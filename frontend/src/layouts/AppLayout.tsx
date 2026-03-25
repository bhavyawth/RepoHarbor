// layouts/AppLayout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/auth.hooks';
import Navbar from '../components/NavBar';
import SideBar from '../components/SideBar';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { useChatStore } from '../store/chat.store';
import { useEffect, useState } from 'react';
import GlobalChatSearchModal from '../components/chat/GlobalChatSearchModal';
import { RepoInfoSheet } from '../components/RepoInfoSheet';
import { useRepoDetails } from '../features/github/github.hooks';
import { useRepoSummary } from '../features/repo/repos.hooks';

export default function AppLayout() {
  const { data: user } = useAuth();
  const { activeChatId, repoInfoOpen, setRepoInfoOpen, repoInfoTarget, setRepoInfoTarget } = useChatStore();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const isNewChatRoute = location.pathname === '/chat/new';
  const {
    data: repoInfo,
    isLoading: repoInfoLoading,
    isError: repoInfoError,
    error: repoInfoErrorValue,
  } = useRepoDetails(
    repoInfoTarget?.owner ?? '',
    repoInfoTarget?.name ?? '',
    repoInfoOpen && !!repoInfoTarget
  );
  const {
    data: repoSummary,
    isLoading: repoSummaryLoading,
    isError: repoSummaryError,
    error: repoSummaryErrorValue,
  } = useRepoSummary(repoInfoOpen && !!repoInfoTarget ? repoInfoTarget?._id : undefined);

  const sidebarOpen = localStorage.getItem("sidebarOpen");

  useEffect(() => {
    if (!user) return;
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [user]);

  useEffect(() => {
    if (!repoInfoOpen) {
      setRepoInfoTarget(null);
    }
  }, [repoInfoOpen, setRepoInfoTarget]);

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
      <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-black">
        <SideBar onOpenSearch={() => setSearchOpen(true)} />
        <SidebarInset className="flex min-w-0 flex-1">
          <div className="flex min-h-0 flex-1 flex-col">
            {(activeChatId || isNewChatRoute) && <Navbar />}
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
        <GlobalChatSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        <RepoInfoSheet
          repoInfoOpen={repoInfoOpen}
          setRepoInfoOpen={setRepoInfoOpen}
          repoInfoLoading={repoSummaryLoading || repoInfoLoading}
          repoInfoError={repoSummaryError || repoInfoError}
          repoInfoErrorValue={repoSummaryError ? repoSummaryErrorValue : repoInfoErrorValue}
          repoInfo={repoInfo}
          repoSummary={repoSummary}
          repoInfoTarget={
            repoInfoTarget
              ? { name: repoInfoTarget.name, owner: repoInfoTarget.owner }
              : undefined
          }
        />
      </div>
    </SidebarProvider>
  );
}
