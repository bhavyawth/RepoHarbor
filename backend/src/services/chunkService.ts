export interface TextChunk {
  repo: string;
  filepath: string;
  content: string;
  startIndex: number;
  chunkIndex: number;
}; //interface for text chunks

export function chunkText(text: string, repo: string, filepath: string, chunkSize=2000, overlap=200) : TextChunk[] {
  const chunks: TextChunk[] = []; //the array to hold all the chunks formed
  const textLength = text.length;
  let position = 0, chunkIndex = 0; 
  if  (chunkSize < 0) {
    throw new Error("chunkSize must be a positive integer");
  }
  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("overlap must be a non-negative integer less than chunkSize");
  }
  if (!text || text.length === 0) {
    return [];
  }
  while (position < textLength) {
    const endPosition = Math.min(position+chunkSize, textLength);
    const content = `File: ${filepath} ${text.slice(position, endPosition)}`;
    chunks.push({
      repo, filepath, content, startIndex: position, chunkIndex
    });
    position+=(chunkSize-overlap);
    chunkIndex++;
  } 
  return chunks;
}

