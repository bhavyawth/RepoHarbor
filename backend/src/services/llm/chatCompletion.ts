import Groq from "groq-sdk";
//todo: make the prompt better for a better response generation
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in environment variables");

const groq = new Groq({ apiKey: GROQ_API_KEY });

function systemPrompt(context: string, repoMap: string): string {
  return `
    You are a senior software engineer assistant helping a user understand a GitHub repository.

    You must follow these rules strictly:

    1. SOURCE OF TRUTH
    - You may ONLY use the information provided in the REPOSITORY CONTEXT.
    - Do NOT use outside knowledge, assumptions, or general programming facts.

    2. FILE PATH HANDLING
    - File paths in the context are case-sensitive.
    - If the user refers to a file using different casing (e.g., "app.jsx" vs "App.jsx"),
      assume they are referring to the closest matching file path present in the context.
    - If multiple files could match, ask for clarification.
    - If no reasonable match exists, clearly say so.

    3. QUESTION INTERPRETATION
    - When the user asks about a specific file, function, or component,
      restrict your explanation ONLY to that file unless explicitly asked otherwise.
    - Do not summarize the entire repository unless requested.

    4. UNCERTAINTY
    - If the answer is not fully present in the context, say:
      "I don't have enough information in the provided repository context to answer this."

    5. RESPONSE STYLE
    - Be concise, technical, and accurate.
    - Prefer bullet points or structured explanations.
    - When helpful, include short code snippets from the context.

    6. NO HALLUCINATION
    - Never invent file names, functions, or behavior not present in the context.
    
    WHEN CONTEXT IS INSUFFICIENT:
    - If a file exists in the repository structure but its contents are not in the context,
      explain the file’s likely role based on its location and references,
      and clearly state that implementation details are unavailable.
    - Suggest what the user can ask next to get more detail.

    You are allowed to infer intent, but not facts.

    BELOW ARE THE REPOSITORY CONTEXT SNIPPETS AND A REPOSITORY MAP PROVIDED TO YOU:
    REPOSITORY CONTEXT:
      ${context}

    REPOSITORY MAP:
      ${repoMap}
  `.trim();
}
async function withRetry(fn: () => Promise<any>, retries = 3) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(r => setTimeout(r, 1000));
    return withRetry(fn, retries - 1);
  }
}
export async function generateAnswer(
  prompt: string, 
  retrievedChunks: string, //context snippets from controller
  repoMapPrompt: string,
  chatHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> {
  if (!prompt.trim()) throw new Error("User question cannot be empty");
  if (!retrievedChunks.trim()) {
    return "No relevant code context was found for your question. Please try rephrasing or ask about a different part of the repository.";
  }
  
  try {
    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt(retrievedChunks, repoMapPrompt),
        },
        ...chatHistory, 
        { role: "user", content: prompt }, 
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2048,
    }));
    const answer = completion.choices[0]?.message?.content;
    if (!answer) {
      throw new Error("No completion returned from Groq API");
    }
    return answer;
  } catch (error: any) {
    if (error?.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (error?.status === 401) throw new Error("Invalid API key. Please check your Groq configuration.");

    console.error("Groq API error:", error?.message || error);
    throw new Error("Failed to generate response. Please try again.");
  }
}
