import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { TextChunk } from './chunkService';
import mongoose from 'mongoose';
import Chunk from '../models/chunkModel';

export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}

export interface RetrievedChunk extends TextChunk {
  score?: number;
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

export async function findSimilarChunks(
  repoId: string,
  repo: string,
  queryEmbedding: number[],
  topK: number = 5
): Promise<RetrievedChunk[]> {
  const objectRepoId = new mongoose.Types.ObjectId(repoId);
  const vectorHits = await Chunk.aggregate<{
    filePath: string;
    content: string;
    startIndex: number;
    chunkIndex: number;
    score: number;
  }>([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: Math.max(topK * 10, topK),
        limit: topK,
        filter: { repoId: objectRepoId },
      },
    },
    {
      $project: {
        _id: 0,
        filePath: 1,
        content: 1,
        startIndex: 1,
        chunkIndex: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);
  return vectorHits.map((hit) => ({
    repo,
    filepath: hit.filePath,
    content: hit.content,
    startIndex: hit.startIndex,
    chunkIndex: hit.chunkIndex,
    score: hit.score,
  }));
}
