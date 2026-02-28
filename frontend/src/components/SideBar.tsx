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

export default function AppSidebar() {
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu className='mt-2 mb-4'>
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
                    <div className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white group-data-[collapsible=icon]:group-hover/logo:hidden dark:bg-sidebar-primary dark:text-sidebar-primary-foreground dark:bg-none">
                      <Logo className="size-10" />
                    </div>
                    <div className="absolute inset-0 hidden items-center justify-center group-data-[collapsible=icon]:group-hover/logo:flex">
                      <SidebarTrigger className="size-11" />
                    </div>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">RepoHarbor</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      Workspace
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
              <SidebarTrigger className="size-11 group-data-[collapsible=icon]:hidden" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search Chats"
              size="lg"
              className="h-10 mb-1 bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 hover:bg-purple-100 hover:text-purple-800 dark:bg-sidebar-accent/40 dark:text-sidebar-foreground dark:ring-sidebar-border/70 dark:hover:bg-sidebar-accent/70
                group-data-[collapsible=icon]:justify-center
                group-data-[collapsible=icon]:px-0
                group-data-[collapsible=icon]:h-11
                group-data-[collapsible=icon]:w-11"
            >
              <Search />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                Search Chats
              </span>
              <kbd className="ml-auto hidden items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium sm:flex group-data-[collapsible=icon]:hidden">
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
              className="h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:text-white hover:shadow-[0_0_0_1px_hsl(var(--sidebar-ring))] dark:from-sidebar-primary/90 dark:to-sidebar-primary dark:hover:from-sidebar-primary dark:hover:to-sidebar-primary/80 dark:text-sidebar-primary-foreground
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
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer gap-2">
                      <Pin className="size-3" />
                      <span className="truncate">Pinned</span>
                      <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {pinnedChats.map((chat) => (
                          <SidebarMenuItem key={chat._id}>
                            <SidebarMenuButton
                              onClick={() => {
                                setActiveChatId(chat._id);
                                navigate(`/chat/${chat._id}`);
                              }}
                              isActive={activeChatId === chat._id}
                              className="h-auto items-start"
                            >
                              <span className='pt-1'><MessageSquare /></span>
                              <div className="flex min-w-0 flex-col items-start">
                                <span className="truncate text-sm font-medium">
                                  {chat.name}
                                </span>
                                <span className="truncate text-xs text-sidebar-foreground/60">
                                  {chat.owner}
                                </span>
                              </div>
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild className='w-8 h-10'>
                                <SidebarMenuAction showOnHover className="rounded-md">
                                  <MoreVertical className="size-4" />
                                  <span className="sr-only">Chat actions</span>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start">
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
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer gap-2">
                    <span className="truncate">All Chats</span>
                    <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {unpinnedChats.map((chat) => (
                        <SidebarMenuItem key={chat._id}>
                          <SidebarMenuButton
                            onClick={() => {
                              setActiveChatId(chat._id);
                              navigate(`/chat/${chat._id}`);
                            }}
                            isActive={activeChatId === chat._id}
                            className="h-auto items-start"
                          >
                            <span className='pt-1'><MessageSquare /></span>
                            <div className="flex min-w-0 flex-col items-start">
                              <span className="truncate text-sm font-medium">
                                {chat.name}
                              </span>
                              <span className="truncate text-xs text-sidebar-foreground/60">
                                {chat.owner}
                              </span>
                            </div>
                          </SidebarMenuButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild className='w-8 h-10'>
                              <SidebarMenuAction showOnHover className="rounded-md">
                                <MoreVertical className="size-4" />
                                <span className="sr-only">Chat actions</span>
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
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

      <SidebarFooter>
        <SidebarMenu className='mb-2'>
          <SidebarMenuItem>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={user.username}
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="size-8 rounded-lg"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">
                        {user.username}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/70">
                        {user.githubId}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56">
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
