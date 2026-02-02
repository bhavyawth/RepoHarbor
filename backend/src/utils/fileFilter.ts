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