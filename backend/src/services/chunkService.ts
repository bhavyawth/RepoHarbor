
interface TextChunk {
  repo: string;
  filepath: string;
  content: string;
  startIndex: number;
  chunkIndex: number;
}; //interface for text chunks


// While we haven't reached the end:
//   - Take a slice of text from current position to position + chunkSize
//   - Store it with metadata
//   - Move forward by (chunkSize - overlap) positions
//above is the logic for chunking the text content from files
//we kinda overlap the chunks by not moving forward by chuncksize but by chunksize - overlap to maintain the context
export function chunkText(text: string, repo: string, filepath: string, chunkSize = 2000, overlap =200) : TextChunk[] {
  const chunks: TextChunk[] = []; //the array to hold all the chunks formed
  const textLength = text.length;
  let position = 0, chunkIndex = 0; // variable to keep track of current position in the text and the index of chunk added to the array
  
  //these are the edge cases handled
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
    const content = text.slice(position, endPosition);
    chunks.push({
      repo, filepath, content, startIndex: position, chunkIndex
    });
    position+=(chunkSize-overlap);
    chunkIndex++;
  } 
  return chunks;
}

