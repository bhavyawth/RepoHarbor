import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { TextChunk } from './chunkService';

export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}

let embedder: FeatureExtractionPipeline | null = null;

async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { quantized: true } //model file faster to load 
    );
  }
  return embedder;
}

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = await getEmbedder();
  const safeBatch = texts.map(t => {
    const trimmed = t.trim();
    return trimmed.length > 1000 ? trimmed.slice(0, 1000) : trimmed;
  });
  const output = await model(safeBatch, { pooling: 'mean', normalize: true });
  return output.tolist();
}

export async function generateEmbeddingsForChunks(chunks: TextChunk[]): Promise<EmbeddedChunk[]> {
  if (chunks.length === 0) return [];
  const BATCH_SIZE = 32;
  const embeddedChunks: EmbeddedChunk[] = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => c.content);
    const embeddings = await generateEmbeddingsBatch(texts);
    batch.forEach((chunk, idx) => {
      embeddedChunks.push({ ...chunk, embedding: embeddings[idx] });
    });
  }
  return embeddedChunks;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await generateEmbeddingsBatch([text]);
  return result[0];
}

export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) throw new Error('Vectors must have same length');
  let dotProduct = 0, mag1 = 0, mag2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (mag1 * mag2);
}

export function findSimilarChunks(queryEmbedding: number[], embeddedChunks: EmbeddedChunk[], topK: number = 5)
  : Array<EmbeddedChunk & { similarity: number }> {
  const chunksWithSimilarity = embeddedChunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
  return chunksWithSimilarity.slice(0, topK);
}