import { create } from "zustand"
import type { Repo, RepoStructure } from "../features/repo/repos.api"

interface ChatState {
  chats: Repo[]
  setChats: (chats: Repo[]) => void
  addChat: (chat: Repo) => void
  removeChat: (chatId: string) => void
  activeChatId: string | null
  setActiveChatId: (chat: string | null) => void
  repoStructuresById: Record<string, RepoStructure>
  setRepoStructure: (repoId: string, repoStructure: RepoStructure) => void
  repoInfoOpen: boolean
  setRepoInfoOpen: (open: boolean) => void
  repoInfoTarget: Repo | null
  setRepoInfoTarget: (repo: Repo | null) => void
  indexingByChatId: Record<string, boolean>
  setChatIndexing: (chatId: string, isIndexing: boolean) => void
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  setChats: (chats) =>
    set({
      chats,
    }),
  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats.filter((existing) => existing._id !== chat._id)],
    })),
  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat._id !== chatId),
    })),

  activeChatId: null,
  setActiveChatId: (chat) =>
    set({
      activeChatId: chat,
    }),

  repoStructuresById: {},
  setRepoStructure: (repoId, repoStructure) =>
    set((state) => ({
      repoStructuresById: {
        ...state.repoStructuresById,
        [repoId]: repoStructure,
      },
    })),

  repoInfoOpen: false,
  setRepoInfoOpen: (open) =>
    set({
      repoInfoOpen: open,
    }),

  repoInfoTarget: null,
  setRepoInfoTarget: (repo) =>
    set({
      repoInfoTarget: repo,
    }),

  indexingByChatId: {},
  setChatIndexing: (chatId, isIndexing) =>
    set((state) => ({
      indexingByChatId: {
        ...state.indexingByChatId,
        [chatId]: isIndexing,
      },
    })),
}))
