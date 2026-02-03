//allowed file extensions
const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rs", ".cpp", ".c", ".cs", ".md", ".json", ".yml", ".yaml"];
const SKIP_DIRS = ["node_modules", ".git", "dist", "build", "out","coverage", ".next", ".cache", "vendor"];
const SKIP_FILES = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
export const MAX_FILE_SIZE = 500*1024; //500kb

export function shouldSkipPath(path: string): boolean {
  const parts = path.split("/");
  if (parts.some(part => SKIP_DIRS.includes(part))) return true;
  if (SKIP_FILES.includes(parts[parts.length - 1])) return true;
  if (path.endsWith(".min.js") || path.endsWith(".map")) return true;
  return false;
}

export function hasAllowedExtension(path: string): boolean {
  return ALLOWED_EXTENSIONS.some(ext => path.endsWith(ext));
}

export function generateRepoStructure(filePaths: string[]): string {
  const tree: Record<string, Set<string>> = {};
  for (const filePath of filePaths) {
    const parts = filePath.split("/");
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      if (!tree[currentPath]) {
        tree[currentPath] = new Set();
      }
      tree[currentPath].add(part);
      if (!isFile) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
      }
    }
  }

  function render(path: string, depth: number): string {
    const entries = Array.from(tree[path] || []).sort();
    let output = "";
    for (const entry of entries) {
      const prefix = depth === 0 ? "" : " ".repeat(depth * 2) + "├─ ";
      output += `${prefix}${entry}\n`;
      const nextPath = path ? `${path}/${entry}` : entry;
      if (tree[nextPath]) {
        output += render(nextPath, depth + 1);
      }
    }
    return output;
  }
  return `Repository Structure:\n\n${render("", 0).trimEnd()}`;
}
