import { NextRequest, NextResponse } from "next/server";

export function getCleanColoringPrompt(rawPrompt: string, characterTraits?: string): string {
  const base = rawPrompt || "a friendly child explorer on an adventure";
  const traits = characterTraits ? `, character details: ${characterTraits}` : "";
  return `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, ${base}${traits}. Strict monochrome black and white line art, ready for coloring with crayons.`;
}

export function getPollinationsImageUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 900000) + 100000;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, characterTraits, pageNumber } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    const enhancedPrompt = getCleanColoringPrompt(prompt, characterTraits);

    // 1. Try OpenAI DALL-E 3 first if a valid key is provided
    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "url",
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const item = data.data?.[0];
          const imageUrl = item?.url;

          if (imageUrl) {
            return NextResponse.json({
              success: true,
              model: "dall-e-3",
              imageUrl,
              usage: data.usage,
              costEstimateUsd: 0.04,
              message: "Real coloring page line-art generated with DALL-E 3",
            });
          }
        } else {
          const errBody = await openAiRes.text();
          console.warn("OpenAI DALL-E 3 request error:", openAiRes.status, errBody);
        }
      } catch (apiErr) {
        console.warn("OpenAI DALL-E 3 call error, switching to high-res engine:", apiErr);
      }
    }

    // 2. High-speed, high-resolution AI line-art generator (Pollinations.ai)
    const pollinationsUrl = getPollinationsImageUrl(enhancedPrompt);

    return NextResponse.json({
      success: true,
      model: "pollinations-lineart",
      imageUrl: pollinationsUrl,
      message: "High-contrast vector line-art generated successfully",
    });
  } catch (error: any) {
    console.error("Error in AI image route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
