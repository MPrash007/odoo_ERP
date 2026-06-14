// ─── Groq AI Client ─────────────────────────────────────

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ─── Ask Copilot ────────────────────────────────────────

export async function askCopilot(
  systemPrompt: string,
  contextData: string,
  userMessage: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      "AI_NOT_CONFIGURED: The AI Copilot is not configured. Please add GROQ_API_KEY to your .env file."
    );
  }

  const userContent = `
═══════════════════════════════════════════════════════
REAL-TIME ERP DATA (from database)
═══════════════════════════════════════════════════════

${contextData}

═══════════════════════════════════════════════════════
USER QUESTION
═══════════════════════════════════════════════════════

${userMessage}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = (errorData as Record<string, unknown>)?.error
        ? JSON.stringify((errorData as Record<string, unknown>).error)
        : `HTTP ${response.status}`;

      console.error("Groq API Error:", errorMsg);

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "AI_NOT_CONFIGURED: Invalid Groq API key. Please check your GROQ_API_KEY in .env file."
        );
      }
      if (response.status === 429) {
        throw new Error(
          "AI_RATE_LIMITED: The AI assistant is receiving too many requests. Please wait a moment and try again."
        );
      }
      throw new Error(`AI_UNKNOWN: Groq API error: ${errorMsg}`);
    }

    const data = await response.json();
    const text = (data as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content;

    if (!text) {
      return "I received your question but wasn't able to generate a response. Please try rephrasing your question.";
    }

    return text;
  } catch (error: unknown) {
    console.error("Groq API Error:", error);

    if (error instanceof Error) {
      // Re-throw our custom errors
      if (error.message.startsWith("AI_")) {
        throw error;
      }

      if (error.message.includes("fetch")) {
        throw new Error(
          "AI_TIMEOUT: Could not connect to Groq. Please check your internet connection."
        );
      }

      throw new Error(`AI_UNKNOWN: ${error.message}`);
    }
    throw new Error("AI_UNKNOWN: An unexpected error occurred with the AI assistant.");
  }
}
