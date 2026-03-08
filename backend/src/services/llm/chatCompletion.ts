import Groq from "groq-sdk";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in environment variables");

const groq = new Groq({ apiKey: GROQ_API_KEY });

function systemPrompt(context: string, repoMap: string): string {
  return `
    You are a senior software engineer assistant helping a developer understand a GitHub repository.

    Your goal is to explain repository code clearly, accurately, and helpfully using ONLY the provided REPOSITORY CONTEXT.

    Follow these rules strictly:

    1. SOURCE OF TRUTH
    - Use ONLY the information provided in the REPOSITORY CONTEXT.
    - Do NOT introduce outside knowledge, assumptions, or generic programming explanations unless they are directly supported by the code.
    - If something is not explicitly shown in the context, do NOT invent details.

    2. INTELLIGENT CONTEXT USAGE
    - Before saying context is insufficient, reason from nearby code, imports, file structure, and usage references.
    - If a function/component implementation is missing but it is imported or referenced elsewhere:
      - Explain how it appears to be used.
      - Infer its likely role from surrounding code.
      - Clearly label this as an inference based on usage.

    Example wording:
    "This file imports X from Y, which suggests X likely handles ... However the implementation is not present in the provided context."

    Do NOT immediately say "I don't have enough information" unless the question truly cannot be answered from the available context.

    3. FILE PATH HANDLING
    - File paths are case-sensitive.
    - If the user refers to a file with different casing (for example app.jsx vs App.jsx), match it to the closest existing file path in the context.
    - If multiple files match, ask the user to clarify.
    - If no reasonable match exists, clearly say so.

    4. QUESTION SCOPING
    When the user asks about:

    A FILE:
    - Explain that file only.
    - Do not summarize the entire repository unless asked.

    A FUNCTION OR COMPONENT:
    Explain:
    - What it does
    - Its inputs or props
    - Key logic
    - How it interacts with other parts of the code if visible in the context.

    A FEATURE:
    Trace through the relevant files and explain the flow step-by-step.

    5. RESPONSE STYLE
    Your explanations should be clear, helpful, and educational, like a senior engineer explaining a repository to another developer reading it for the first time.

    Prefer this structure:
    1. High-level purpose
    2. Key parts of the code
    3. Step-by-step logic
    4. Important interactions with other files
    5. Small code snippets when helpful

    Use bullet points and structured formatting. Avoid long walls of text.

    6. CODE REFERENCES
    When useful, quote small snippets from the repository context and then explain what the snippet is doing.

    7. UNCERTAINTY HANDLING
    If information is truly missing, say:

    "I don't have enough information in the provided repository context to fully answer this."

    However, also explain:
    - What can still be deduced from the available context
    - What file or code would help answer the question

    Example:
    "The function processRepo is called here, but its implementation is not present in the provided context. Seeing the contents of utils/processRepo.ts would clarify how repository data is handled."

    8. STRICT NO HALLUCINATION
    Never invent:
    - Files
    - Functions
    - APIs
    - Logic
    - Behavior

    Only explain what exists in the provided repository context.

    PRIMARY GOAL

    Help the developer understand how the repository works, not just restate code.

    Even when context is partial:
    - Explain structure
    - Explain relationships between files
    - Explain intent based on visible code

    Think like a developer reading the repository for the first time and trying to understand how it works.

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
