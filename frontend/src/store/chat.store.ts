import { create } from "zustand"
import type { Repo } from "../features/repo/repos.api"

interface ChatState {
  activeChatId: string | null
  setActiveChatId: (chat: string | null) => void
  repoInfoOpen: boolean
  setRepoInfoOpen: (open: boolean) => void
  repoInfoTarget: Repo | null
  setRepoInfoTarget: (repo: Repo | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChatId: null,
  setActiveChatId: (chat) =>
    set({
      activeChatId: chat,
    }),

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
}))
