import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], currentBook, referenceImageUrl } = body;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are PaperTales, an empathetic, creative AI children's book publishing assistant and co-creation copilot.
Your mission is to help parents, kids, teachers, and creators build personalized, physical printed books with Lulu print-on-demand and PayPal checkout.

We support 4 Creative Lanes:
1. coloring_book: 300 DPI high-contrast black-and-white vector line art, thick borders, zero shading, ready for crayons.
2. memory_book: Family keepsakes, milestones, photo-to-story chapters, warm sentimental narratives.
3. math_book: Interactive counting quests, geometric shape riddles, arithmetic word puzzles.
4. science_book: Space astronomy voyages, dinosaur fossil digs, ocean bioluminescence, STEM learning.

First 5 pages are 100% free gift. Additional pages scale at $0.17/page (~₹14.50 INR). Lulu POD print cost is ~$4.14 + tracked shipping ~$5.69.

Your response MUST be valid JSON adhering strictly to this schema:
{
  "reply": "Your warm, helpful conversational response explaining your creative ideas, asking a clarifying question, or celebrating their concept (keep it 2-3 paragraphs max).",
  "bookDraft": {
    "title": "A catchy, imaginative book title",
    "subtitle": "A short, descriptive subtitle",
    "genre": "coloring_book" | "memory_book" | "math_book" | "science_book",
    "characterName": "Name of protagonist",
    "characterType": "Species, archetype or age (e.g. Golden Retriever Puppy, 5yo Explorer, Clever Fox)",
    "characterTraits": ["Trait 1", "Trait 2", "Trait 3"],
    "prompt": "Detailed story/adventure prompt capturing the narrative arc",
    "pageCount": 5,
    "channel3Query": "Specific search query for physical art supplies or companion toys matching this exact story (e.g. 'crayola washable markers', 'space stickers metallic pens', 'kids baking apron set', 'wooden counting abacus')"
  },
  "quickReplies": ["3 short, engaging suggested next questions or prompts the user could click"]
}

Always keep tone encouraging, imaginative, and concise. Only output valid JSON with no markdown backticks outside.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return NextResponse.json(
        { success: false, error: `OpenAI error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(rawContent);

    return NextResponse.json({
      success: true,
      reply: parsed.reply,
      bookDraft: parsed.bookDraft,
      quickReplies: parsed.quickReplies || [],
    });
  } catch (error: any) {
    console.error("Error in PaperTales AI chat:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
