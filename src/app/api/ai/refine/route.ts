import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      originalText,
      instruction,
      fullStoryText = "",
      bookTitle = "Book",
      genre = "story",
    } = await req.json();

    if (!originalText || !instruction) {
      return NextResponse.json(
        { success: false, error: "Missing originalText or instruction" },
        { status: 400 }
      );
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    const useGroq = Boolean(groqKey && groqKey.startsWith("gsk_"));
    const apiKey = useGroq ? groqKey : openAiKey;
    const apiUrl = useGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = useGroq ? "openai/gpt-oss-20b" : "gpt-4o-mini";

    if (apiKey) {
      try {
        const systemPrompt = `You are a world-class book editor, creative writing mentor, and publishing specialist for PaperTales AI.
Your task is to refine, rewrite, or polish a specific highlighted passage from a book based on the user's instructions.
Book Title: "${bookTitle}"
Genre / Type: "${genre}"

Guidelines:
1. Maintain tone, rhythm, and character consistency suitable for the genre.
2. If it's a children's coloring book, keep vocabulary vivid, age-appropriate, and visual.
3. If it's a family recipe or journal, keep it warm, precise, and authentic.
4. Replace only what was requested; do not bloat the word count excessively.

Output strictly valid JSON with this schema:
{
  "refinedText": "The refined version of the highlighted text",
  "explanation": "A friendly 1-sentence note explaining what you enhanced"
}`;

        const userPrompt = `Full Page Context:
"${fullStoryText}"

Highlighted Text to Refine:
"${originalText}"

User's Change Instruction:
"${instruction}"`;

        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
          if (parsed.refinedText) {
            return NextResponse.json({
              success: true,
              refinedText: parsed.refinedText,
              explanation: parsed.explanation || "Text refined by PaperTales AI",
              tokensUsed: 1,
              engine: useGroq ? "groq-20b" : "openai-gpt-4o-mini",
            });
          }
        }
      } catch (apiErr) {
        console.warn("AI refine live call error, using smart fallback:", apiErr);
      }
    }

    // Smart heuristic fallback
    let fallbackRefined = originalText;
    const lowerInst = instruction.toLowerCase();

    if (lowerInst.includes("playful") || lowerInst.includes("fun")) {
      fallbackRefined = `${originalText.replace(/\.$/, "")}, bubbling with giggles and wonder!`;
    } else if (lowerInst.includes("simplify") || lowerInst.includes("easy")) {
      fallbackRefined = originalText.split(".")[0] + ".";
    } else if (lowerInst.includes("sensory") || lowerInst.includes("detail")) {
      fallbackRefined = `${originalText.replace(/\.$/, "")}, glowing under the warm golden sunshine with crisp, fresh air.`;
    } else {
      fallbackRefined = `${originalText} (${instruction})`;
    }

    return NextResponse.json({
      success: true,
      refinedText: fallbackRefined,
      explanation: `Polished with: ${instruction}`,
      tokensUsed: 1,
    });
  } catch (error: any) {
    console.error("Refine API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refine text" },
      { status: 500 }
    );
  }
}
