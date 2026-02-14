import { FolderTree, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
// import { ScrollArea } from './ui/scroll-area';
import { File, Folder, Tree } from './ui/file-tree';
import type { RepoNode } from '../features/repo/repos.api';

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
  return (
    <div className="repo-summary-panel absolute top-full left-1/2 z-10 mt-2 w-[min(520px,90vw)] -translate-x-1/2 rounded-lg border border-border bg-popover p-4 text-sm shadow-xl max-h-[60vh] flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <FolderTree className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          {repoName} Structure
        </div>
        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={onClose}>
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
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error instanceof Error ? error.message : 'Failed to fetch repository structure.'}
        </div>
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

//todo: to fix the scroll issue and delte extra action button from navbar