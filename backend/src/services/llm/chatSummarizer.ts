import Groq from "groq-sdk";
import path from "path/win32";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in environment variables");

const groq = new Groq({ apiKey: GROQ_API_KEY });

function systemPrompt(): string {
  return `
    ### TASK
    Summarize the following technical exchange regarding [Repository Name].
    ### CONSTRAINTS
    - Use telegrammatic style (omit articles like "the", "a", "an").
    - Use path/to/file or functionName() syntax.
    - No conversational filler.
    ### OUTPUT SCHEMA
    **1. Technical Context**
    * [File/Function] -> [Purpose/Discussion point]
    **2. Logic & Architecture**
    * [Decision/Fix]: [Brief reasoning]
    **3. Roadmap/Backlog**
    * [Action Item]: [Target component]
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
        {
          role: "user",
          content: "Provide a concise technical summary of the above discussion.",
        }
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