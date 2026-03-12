import { ApiError, GoogleGenAI } from '@google/genai';
import { TextChunk } from './chunkService';
import mongoose from 'mongoose';
import Chunk from '../models/chunkModel';

export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}

export interface RetrievedChunk extends TextChunk {
  score?: number;
}

const GEMINI_MODEL = 'gemini-embedding-001';
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

function getGeminiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const status = error.status ?? 'unknown';
    return `Gemini API error (${status}): ${error.message}`;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Unknown error';
}

function toSafeText(text: string, maxLength: number): string {
  const trimmed = text.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

async function embedSingleText(text: string): Promise<number[]> {
  const ai = getGeminiClient();
  const response = await ai.models.embedContent({
    model: GEMINI_MODEL,
    contents: [text],
  });
  const values = response.embeddings?.[0]?.values;
  if (!Array.isArray(values)) {
    throw new Error('Gemini returned an invalid embedding payload');
  }
  return values;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const ai = getGeminiClient();
  const response = await ai.models.embedContent({
    model: GEMINI_MODEL,
    contents: texts
  });
  const embeddings = (response.embeddings ?? []).map((embedding) => embedding.values);
  if (embeddings.length !== texts.length || embeddings.some((embedding) => !Array.isArray(embedding))) {
    throw new Error('Gemini returned an invalid batch embedding payload');
  }
  return embeddings as number[][];
}

async function generateDocumentEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const safeTexts = texts.map((text) => toSafeText(text, 16000));
  try {
    return await embedBatch(safeTexts);
  } catch (error: unknown) {
    throw new Error(`Failed to generate document embeddings with Gemini: ${getGeminiErrorMessage(error)}`);
  }
}

export async function generateEmbeddingsForChunks(chunks: TextChunk[]): Promise<EmbeddedChunk[]> {
  if (chunks.length === 0) return [];
  const BATCH_SIZE = 32;
  const embeddedChunks: EmbeddedChunk[] = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => c.content);
    const embeddings = await generateDocumentEmbeddingsBatch(texts);
    batch.forEach((chunk, idx) => {
      embeddedChunks.push({ ...chunk, embedding: embeddings[idx] });
    });
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return embeddedChunks;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const safeText = toSafeText(text, 16000);
  try {
    return await embedSingleText(safeText);
  } catch (error: unknown) {
    throw new Error(`Failed to generate query embedding with Gemini: ${getGeminiErrorMessage(error)}`);
  }
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
