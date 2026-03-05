export interface TextChunk {
  repo: string;
  filepath: string;
  content: string;
  startIndex: number;
  chunkIndex: number;
}

const DEFAULT_CHUNK_SIZE = 2000;
const DEFAULT_OVERLAP = 200;
const SPLIT_BOUNDARIES = ["\n\n", "\n", " "];

function findSplitPoint(text: string, idealEnd: number): number {
  for (const boundary of SPLIT_BOUNDARIES) {
    const idx = text.lastIndexOf(boundary, idealEnd);
    if (idx > idealEnd*0.5) return idx + boundary.length;
  }
  return idealEnd;
}

export function chunkText(
  text: string,
  repo: string,
  filepath: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): TextChunk[] {
  if (!text || typeof text !== "string") text = JSON.stringify(text ?? "", null, 2);
  if (chunkSize <= 0) throw new Error("chunkSize must be a positive integer");
  if (overlap < 0 || overlap >= chunkSize) throw new Error("overlap must be non-negative and less than chunkSize");
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (normalized.trim().length === 0) return [];
  const chunks: TextChunk[] = [];
  let position = 0;
  let chunkIndex = 0;
  while (position < normalized.length) {
    const idealEnd = Math.min(position + chunkSize, normalized.length);
    const end = idealEnd === normalized.length? idealEnd : findSplitPoint(normalized, idealEnd);
    const content = normalized.slice(position, end).trim();
    if (content.length > 0) {
      chunks.push({ repo, filepath, content, startIndex: position, chunkIndex });
      chunkIndex++;
    }
    const nextPosition = end - overlap;
    if (nextPosition <= position) {
      position += chunkSize - overlap;
    } else {
      position = nextPosition;
    }
    if (position >= normalized.length) break;
  }
  return chunks;
}