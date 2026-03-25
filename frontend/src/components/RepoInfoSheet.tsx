import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { type RepoDetails } from "../features/github/github.api"
import MarkdownRenderer from "./chat/MarkdownRenderer"
import ApiErrorAlert from "./ui/ApiErrorAlert"

type Props = {
  repoInfoOpen: boolean
  setRepoInfoOpen: (v: boolean) => void
  repoInfoLoading: boolean
  repoInfoError: boolean
  repoInfoErrorValue?: unknown
  repoInfo?: RepoDetails
  repoSummary?: { summary: string }
  repoInfoTarget?: {
    name: string
    owner: string
  }
}

export function RepoInfoSheet({
  repoInfoOpen,
  setRepoInfoOpen,
  repoInfoLoading,
  repoInfoError,
  repoInfoErrorValue,
  repoInfo,
  repoSummary,
  repoInfoTarget,
}: Props) {
  const description =
    repoInfo?.description?.trim() ||
    repoSummary?.summary?.trim() ||
    "No description provided."

  const showLoading = repoInfoLoading && !repoInfoError

  return (
    <div className="dark:bg-slate-950 dark:border-slate-800 overflow-auto max-h-screen">
      <Sheet open={repoInfoOpen} onOpenChange={setRepoInfoOpen}>
        <SheetContent side="right" className="w-[360px] sm:w-[420px]">
          <div className="flex items-start justify-between">
            <SheetHeader className="p-0">
              <SheetTitle className="text-lg mt-4 ml-4">Repository Info</SheetTitle>
            </SheetHeader>
            <SheetClose className="rounded-md transition hover:bg-sidebar-accent/50" />
          </div>
          <div className="mt-4 mx-2 space-y-4 text-sm">
            {showLoading && (
              <div className="rounded-lg border border-sidebar-border/60 p-4">
                Loading repo details...
              </div>
            )}
            {repoInfoError && (
              <ApiErrorAlert
                error={repoInfoErrorValue}
                className="p-4"
              />
            )}
            {!showLoading && !repoInfoError && repoInfoTarget && (
              <div className="space-y-4 rounded-lg border border-sidebar-border/60 bg-sidebar/30 p-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {repoInfo?.name ?? repoInfoTarget.name}
                  </h3>
                  <p className="text-sm text-sidebar-foreground/70">
                    {repoInfoTarget.owner}
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto text-sm">
                  <MarkdownRenderer content={description} className="prose-sm" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-sidebar-accent px-2 py-1 text-xs">
                    ⭐ {repoInfo?.stargazers_count ?? 0}
                  </span>
                  <span className="rounded-md bg-sidebar-accent px-2 py-1 text-xs">
                    🍴 {repoInfo?.forks_count ?? 0}
                  </span>
                  {repoInfo?.language && (
                    <span className="rounded-md bg-sidebar-accent px-2 py-1 text-xs">
                      {repoInfo.language}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="uppercase text-sidebar-foreground/60">
                      Default Branch
                    </div>
                    <div>{repoInfo?.default_branch || "Unknown"}</div>
                  </div>
                  <div>
                    <div className="uppercase text-sidebar-foreground/60">
                      License
                    </div>
                    <div>{repoInfo?.license?.name ?? "None"}</div>
                  </div>
                  <div>
                    <div className="uppercase text-sidebar-foreground/60">
                      Created
                    </div>
                    <div>
                      {repoInfo?.created_at
                        ? new Date(repoInfo.created_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="uppercase text-sidebar-foreground/60">
                      Updated
                    </div>
                    <div >
                      {repoInfo?.updated_at
                        ? new Date(repoInfo.updated_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="uppercase text-sidebar-foreground/60">
                      URL
                    </div>
                    <div>
                      {repoInfo?.html_url ? (
                        <a
                          href={repoInfo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400 text-sm"
                        >
                          View on GitHub
                        </a>
                      ) : ("Unknown")}
                    </div>
                  </div>
                </div>
                {repoInfo?.topics?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {repoInfo.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
