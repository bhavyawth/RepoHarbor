// components/SideBar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Search,
  Plus,
  MessageSquare,
  Pin,
  ChevronDown,
  LogOut,
  ChevronsUpDown,
  MoreVertical,
  Trash2,
  Info,
} from 'lucide-react';
import Logo from './Logo';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';
import { RepoInfoSheet } from './RepoInfoSheet';
import { useAuth, useLogout } from '../features/auth/auth.hooks';
import { useChatStore } from '../store/chat.store';
import { useDeleteRepo, useGetRepos, usePinRepo, useRepoSummary } from '../features/repo/repos.hooks';
import type { Repo } from '../features/repo/repos.api';
import { useRepoDetails } from '../features/github/github.hooks';

type AppSidebarProps = {
  onOpenSearch?: () => void;
};

export default function AppSidebar({ onOpenSearch }: AppSidebarProps) {
  const { state } = useSidebar();
  let isCollapsed = state === 'collapsed';
  const { data: repos } = useGetRepos();
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { mutate: logout } = useLogout()
  const pinRepoMutation = usePinRepo();
  const deleteRepoMutation = useDeleteRepo();

  const { chats, setChats, activeChatId, setActiveChatId, removeChat } = useChatStore();
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [allChatsOpen, setAllChatsOpen] = useState(true);
  const { repoInfoTarget, setRepoInfoTarget } = useChatStore();
  const { repoInfoOpen, setRepoInfoOpen } = useChatStore();
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

  const pinnedChats: Repo[] = chats.filter((repo) => repo.isPinned).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const unpinnedChats: Repo[] = chats.filter((repo) => !repo.isPinned).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  const handlePinRepo = (repoId: string) => {
    pinRepoMutation.mutate(repoId);
  };
  const handleDeleteRepo = (repoId: string) => {
    deleteRepoMutation.mutate(repoId);
    removeChat(repoId);
    if (activeChatId === repoId) {
      setActiveChatId(null);
      navigate('/chat/new');
    }
  }
  const handleRepoInfo = (repo: Repo) => {
    setRepoInfoTarget(repo);
    setRepoInfoOpen(true);
  };

  useEffect(() => {
    const sidebarOpen = localStorage.getItem('sidebarOpen');
    isCollapsed = sidebarOpen === 'false';
    if (sidebarOpen === null) {
      localStorage.setItem('sidebarOpen', 'true');
    } else {
      localStorage.setItem('sidebarOpen', state !== 'collapsed' ? 'true' : 'false');
    }
  }, [state]);

  useEffect(() => {
    if (!repoInfoOpen) {
      setRepoInfoTarget(null);
    }
  }, [repoInfoOpen]);

  useEffect(() => {
    if (repos) {
      setChats(repos);
    }
  }, [repos, setChats]);


  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/80 bg-white/95 text-slate-900 backdrop-blur-sm dark:border-slate-800 dark:bg-black/95 dark:text-slate-100"
    >
      <SidebarHeader className="px-3 pt-3 pb-2">
        <SidebarMenu className='mb-3'>
          <SidebarMenuItem>
            <div className="flex items-center gap-2">
              <SidebarMenuButton
                asChild
                size="lg"
                tooltip="RepoHarbor"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="group/logo flex flex-1 items-center gap-2">
                  <div className="relative flex aspect-square size-11 items-center justify-center">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition-colors group-data-[collapsible=icon]:group-hover/logo:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      <Logo className="size-10" />
                    </div>
                    <div className="absolute inset-0 hidden items-center justify-center group-data-[collapsible=icon]:group-hover/logo:flex">
                      <SidebarTrigger className="size-11 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" />
                    </div>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-slate-900 dark:text-slate-100">RepoHarbor</span>
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      Workspace
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
              <SidebarTrigger className="size-11 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search Chats"
              size="lg"
              onClick={onOpenSearch}
              className="h-10 rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100
                group-data-[collapsible=icon]:justify-center
                group-data-[collapsible=icon]:px-0
                group-data-[collapsible=icon]:h-11
                group-data-[collapsible=icon]:w-11"
            >
              <Search />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                Search Chats
              </span>
              <kbd className="ml-auto hidden items-center gap-1 rounded-md border border-slate-300 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:flex group-data-[collapsible=icon]:hidden dark:border-slate-700 dark:text-slate-400">
                Ctrl K
              </kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New Chat"
              size="lg"
              onClick={() => {
                setActiveChatId(null);
                navigate('/chat/new');
              }}
              className="h-10 rounded-xl bg-slate-900 text-white  hover:text-amber-50 shadow-sm transition-all hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200
                group-data-[collapsible=icon]:justify-center
                group-data-[collapsible=icon]:px-0
                group-data-[collapsible=icon]:h-11
                group-data-[collapsible=icon]:w-11"
            >
              <Plus />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                New Chat
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!isCollapsed && (
          <>
            {pinnedChats.length > 0 && (
              <Collapsible
                open={pinnedOpen}
                onOpenChange={setPinnedOpen}
                className="group/collapsible"
              >
                <SidebarGroup className="px-3 pt-1 pb-0">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer gap-2 rounded-lg px-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70">
                      <Pin className="size-3.5" />
                      <span className="truncate">Pinned</span>
                      <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent className="pt-1">
                      <SidebarMenu>
                        {pinnedChats.map((chat) => (
                          <SidebarMenuItem key={chat._id}>
                            <SidebarMenuButton
                              onClick={() => {
                                setActiveChatId(chat._id);
                                navigate(`/chat/${chat._id}`);
                              }}
                              isActive={activeChatId === chat._id}
                              className="h-auto items-start rounded-xl border border-transparent px-2.5 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800/70 data-[active=true]:border-slate-300 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 dark:data-[active=true]:border-slate-700 dark:data-[active=true]:bg-slate-800 dark:data-[active=true]:text-slate-100"
                            >
                              {/* <span className='pt-1'><MessageSquare /></span> todo: replace it with something else*/} 
                              <div className="flex min-w-0 flex-col items-start pl-1">
                                <span className="truncate text-sm font-medium">
                                  {chat.name}
                                </span>
                                <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {chat.owner}
                                </span>
                              </div>
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild className='w-8 h-10 mt-0.5'>
                                <SidebarMenuAction showOnHover className="rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-200">
                                  <MoreVertical className="size-4 " />
                                  <span className="sr-only">Chat actions</span>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start" className="rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2"
                                  onClick={() => handlePinRepo(chat._id)}
                                >
                                  <Pin className="size-4" />
                                  {chat.isPinned ? 'Unpin' : 'Pin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2"
                                  onClick={() => handleRepoInfo(chat)}
                                >
                                  <Info className="size-4" />
                                  Repo Info
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 dark:text-red-400"
                                  onClick={() => handleDeleteRepo(chat._id)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}

            <Collapsible
              open={allChatsOpen}
              onOpenChange={setAllChatsOpen}
              className="group/collapsible"
            >
              <SidebarGroup className="px-3 pt-3">
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer gap-2 rounded-lg px-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70">
                    <span className='size-4'><MessageSquare className="size-3.5" /></span>
                    <span className="truncate">All Chats</span>
                    <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="pt-1">
                    <SidebarMenu>
                      {unpinnedChats.map((chat) => (
                        <SidebarMenuItem key={chat._id}>
                          <SidebarMenuButton
                            onClick={() => {
                              setActiveChatId(chat._id);
                              navigate(`/chat/${chat._id}`);
                            }}
                            isActive={activeChatId === chat._id}
                            className="h-auto items-start rounded-xl border border-transparent px-2.5 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800/70 data-[active=true]:border-slate-300 data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 dark:data-[active=true]:border-slate-700 dark:data-[active=true]:bg-slate-800 dark:data-[active=true]:text-slate-100"
                          >
                            {/* <span className='pt-1'><MessageSquare /></span> */}
                            <div className="flex min-w-0 flex-col items-start pl-1">
                              <span className="truncate text-sm font-medium">
                                {chat.name}
                              </span>
                              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {chat.owner}
                              </span>
                            </div>
                          </SidebarMenuButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild className='w-8 h-10'>
                              <SidebarMenuAction showOnHover className="rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-200">
                                <MoreVertical className="size-4" />
                                <span className="sr-only">Chat actions</span>
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start" className="rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => handlePinRepo(chat._id)}>
                                <Pin className="size-4" />
                                {chat.isPinned ? 'Unpin' : 'Pin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={() => handleRepoInfo(chat)}
                              >
                                <Info className="size-4" />
                                Repo Info
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-red-600 dark:text-red-400"
                                onClick={() => handleDeleteRepo(chat._id)}
                              >
                                <Trash2 className="size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3 pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
        <SidebarMenu>
          <SidebarMenuItem>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={user.username}
                    className="rounded-xl border border-slate-200/80 bg-white text-slate-800 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="size-8 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">
                        {user.username}
                      </span>
                      <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user.githubId}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                      <AnimatedThemeToggler className="flex w-full items-center gap-2">
                        <span className="items-center gap-3 px-2 pb-1">
                          Toggle Theme
                        </span>
                      </AnimatedThemeToggler>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLogout()}
                    className="cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <RepoInfoSheet
        repoInfoOpen={repoInfoOpen}
        setRepoInfoOpen={setRepoInfoOpen}
        repoInfoLoading={repoSummaryLoading || repoInfoLoading}
        repoInfoError={repoSummaryError || repoInfoError}
        repoInfoErrorMessage={
          repoSummaryError
            ? (repoSummaryErrorValue instanceof Error
              ? repoSummaryErrorValue.message
              : 'Failed to load repository summary.')
            : repoInfoError
              ? (repoInfoErrorValue instanceof Error
                ? repoInfoErrorValue.message
                : 'Failed to load repo details.')
              : undefined
        }
        repoInfo={repoInfo}
        repoSummary={repoSummary}
        repoInfoTarget={
          repoInfoTarget
            ? { name: repoInfoTarget.name, owner: repoInfoTarget.owner }
            : undefined
        }
      />
    </Sidebar>
  );
}
