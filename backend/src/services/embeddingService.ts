import axios from 'axios';
import { TextChunk } from './chunkService';
import dotenv from 'dotenv';
dotenv.config();
const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction';
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

export interface EmbeddedChunk extends TextChunk {
  embedding: number[];
}
//single text embedding generation serv
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!HF_TOKEN) throw new Error('Hf API token might not be set in the .env file!');
  if (!text || !text.trim().length) throw new Error('Text cant be empty!');
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: text,
        options: { wait_for_model: true }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const embedding = response.data;
    if (!Array.isArray(embedding)) throw new Error('Unexpected response format from Hugging Face');
    return embedding;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(`Hugging Face API error: ${error.response?.status} - ${error.message}`);
    }
    console.error('Error generating embedding:', error);
    throw error;
  }
}
//multiple text embedging generation
export async function generateEmbeddingsForChunks(chunks: TextChunk[]): Promise<EmbeddedChunk[]> {
  const embeddedChunks: EmbeddedChunk[] = [];
  console.log(`🔄 Generating embeddings for ${chunks.length} chunks...`);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const embedding = await generateEmbedding(chunk.content); 
      embeddedChunks.push({
        ...chunk,
        embedding
      });
      //todo: remove log in the final phases
      if ((i + 1) % 10 === 0 || i === chunks.length - 1) console.log(`✅ Progress: ${i + 1}/${chunks.length} embeddings generated`); 
      if (i < chunks.length - 1) await delay(100); //for rate limit dealing
    } catch (error) {
      console.error(`❌ Failed to generate embedding for chunk ${i}:`, error);
    }
  }
   //todo: remove log in the final phases
  console.log(`✅ Generated ${embeddedChunks.length} embeddings successfully`);
  return embeddedChunks;
}
//function to check for similarity
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) throw new Error('Vectors must have the same length');
  let dotProduct=0, mag1=0, mag2=0;
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i]*vec2[i];
    mag1 += vec1[i]*vec1[i];
    mag2 += vec2[i]*vec2[i];
  }
  mag1 = Math.sqrt(mag1); mag2 = Math.sqrt(mag2);
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct/(mag1*mag2);
}
//retrieving the top k similar chunks
export function findSimilarChunks(queryEmbedding: number[], embeddedChunks: EmbeddedChunk[], topK: number = 5)
: Array<EmbeddedChunk & { similarity: number }> {
  const chunksWithSimilarity = embeddedChunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
  const topKChunksWithSimilarity=chunksWithSimilarity.slice(0, topK);
  return topKChunksWithSimilarity;
}
//delay function for rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
