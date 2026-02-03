import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in environment variables");

const groq = new Groq({ apiKey: GROQ_API_KEY });

function systemPrompt(): string {
  return `
    ### ROLE
    You are a Senior Software Architect. Your task is to summarize a technical discussion between a user and an AI about a specific repository.

    ### OBJECTIVES
    1.  **Technical Highlights**: Identify specific files, functions, or directories discussed.
    2.  **Logic & Decisions**: Summarize any architectural decisions, bug fixes, or logic explanations provided.
    3.  **Action Items**: Note any suggested changes or "todo" items mentioned.

    ### FORMAT
    - Use technical, concise language.
    - Provide the output in a clean, bulleted list.
    - Do not include conversational filler (e.g., "The user asked about..."). Start directly with the technical points.
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
export async function generateSummary(chatHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>): Promise<string> {
  try {
    const completion = await withRetry(() => groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt(),
        },
        ...chatHistory, 
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2048,
    }));
    const answer = completion.choices[0]?.message?.content;
    if (!answer) throw new Error("No completion returned from Groq API");
    return answer;
  } catch (error: any) {
    if (error?.status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (error?.status === 401) throw new Error("Invalid API key. Please check your Groq configuration.");
    console.error("Groq API error:", error?.message || error);
    throw new Error("Failed to generate response. Please try again.");
  }
}