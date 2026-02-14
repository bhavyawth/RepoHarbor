// allowed file extensions
const ALLOWED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".java",
  ".rs",
  ".cpp",
  ".c",
  ".cs",
  ".md",
  ".json",
  ".yml",
  ".yaml",
];
const SKIP_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  ".cache",
  "vendor",
];
const SKIP_FILES = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
export const MAX_FILE_SIZE = 500 * 1024; // 500kb

export interface RepoNode {
  name: string;
  type: "file" | "folder";
  children?: RepoNode[];
}

export function shouldSkipPath(path: string): boolean {
  const parts = path.split("/");
  if (parts.some((part) => SKIP_DIRS.includes(part))) return true;
  if (SKIP_FILES.includes(parts[parts.length - 1])) return true;
  if (path.endsWith(".min.js") || path.endsWith(".map")) return true;
  return false;
}

export function hasAllowedExtension(path: string): boolean {
  return ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext));
}

export function buildJsonTree(filePaths: string[]): RepoNode[] {
  const root: RepoNode[] = [];
  for (const filePath of filePaths) {
    const parts = filePath.split("/").filter(Boolean);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const type: RepoNode["type"] = isFile ? "file" : "folder";
      let node = cursor.find((entry) => entry.name === name && entry.type === type);
      if (!node) {
        node = isFile ? { name, type } : { name, type, children: [] };
        cursor.push(node);
      }
      if (!isFile) {
        cursor = node.children ?? [];
      }
    }
  }

  const sortNodes = (nodes: RepoNode[]): RepoNode[] =>
    nodes
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((node) =>
        node.children
          ? { ...node, children: sortNodes(node.children) }
          : node
      );
  return sortNodes(root);
}

export function treeToPrompt(tree: RepoNode[], depth = 0): string {
  const lines: string[] = [];
  for (const node of tree) {
    const prefix = depth === 0 ? "" : `${" ".repeat(depth * 2)}- `;
    lines.push(`${prefix}${node.name}`);
    if (node.type === "folder" && node.children?.length) {
      lines.push(treeToPrompt(node.children, depth + 1));
    }
  }
  return lines.join("\n");
}

