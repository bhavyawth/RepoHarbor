import Groq from "groq-sdk";
//todo: make the prompt better for a better response generation
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
// const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"; not needed with groq-sdk
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function generateAnswer(
  prompt: string, 
  retrievedChunks: string, //context snippets from controller
  chatHistory: Array<{ role: "system" | "user" | "assistant"; content: string }>
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
            ### SYSTEM ROLE
            You are a helpful, professional AI assistant. Your task is to answer the user's question using ONLY the provided context below. 

            ### CONTEXT
            The following are snippets retrieved from our database relevant to the user's query:
            ${retrievedChunks}

            ### CONSTRAINTS & INSTRUCTIONS
            1. **Groundedness**: Answer the question using only the information in the CONTEXT. Do not use outside knowledge or make up facts.
            2. **Uncertainty**: If the CONTEXT does not contain the answer, state: "I'm sorry, but I don't have enough information in my records to answer that." 
            3. **Citations**: If possible, reference which part of the context you are using (e.g., "According to [Source X]...").
            4. **Style**: Keep the response concise and direct.
          ` ,
        },
        ...chatHistory, 
        { role: "user", content: prompt }, 
      ],
      model: "llama-3.3-70b-versatile",
    });
    const answer = completion.choices[0]?.message?.content;
    if (!answer) {
      throw new Error("No completion returned from Groq API");
    }
    return answer;
  } catch (error) {
    console.error("LLM generation failed:", error);
    return "I'm sorry, but I couldn't generate an answer at this time.";
  }
}