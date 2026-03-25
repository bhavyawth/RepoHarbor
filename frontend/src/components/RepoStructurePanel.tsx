import { FolderTree, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
// import { ScrollArea } from './ui/scroll-area';
import { File, Folder, Tree } from './ui/file-tree';
import type { RepoNode } from '../features/repo/repos.api';
import { useEffect } from 'react';
import ApiErrorAlert from './ui/ApiErrorAlert';

type Props = {
  repoName: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  tree?: RepoNode[];
  onClose: () => void;
};

function renderTree(nodes: RepoNode[], parent = 'root') {
  return nodes.map((node, index) => {
    const id = `${parent}/${node.name}-${index}`;
    if (node.type === 'folder') {
      return (
        <Folder key={id} value={id} element={node.name}>
          {node.children?.length ? renderTree(node.children, id) : null}
        </Folder>
      );
    }
    return (
      <File key={id} value={id}>
        {node.name}
      </File>
    );
  });
}

export function RepoStructurePanel({
  repoName,
  isLoading,
  isError,
  error,
  tree,
  onClose,
}: Props) {
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div className="repo-summary-panel dark:bg-slate-950 dark:border-slate-800 absolute top-full left-1/2 z-10 mt-2 w-[min(520px,90vw)] -translate-x-1/2 rounded-lg border border-border bg-popover p-4 text-sm shadow-xl max-h-[60vh] flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <FolderTree className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          {repoName} Structure
        </div>
        <Button
          variant="ghost"
          className="h-7 px-2 text-xs transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fetching repository structure...
        </div>
      )}
      {!isLoading && isError && (
        <ApiErrorAlert error={error} />
      )}
      {!isLoading && !isError && (
        <div className="overflow-auto pr-3 min-h-0">
          {tree?.length ? (
            <Tree className="w-full">{renderTree(tree)}</Tree>
          ) : (
            <div className="text-muted-foreground">No structure data available.</div>
          )}
        </div>
      )}
    </div>
  );
}
