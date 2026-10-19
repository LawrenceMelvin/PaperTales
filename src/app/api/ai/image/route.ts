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

    // 1. Try OpenAI GPT-Image-2.5 (Sunburst) / GPT-Image-2 first
    if (apiKey && apiKey.startsWith("sk-")) {
      const preferredModels = [
        process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst-2026-09-08",
        "gpt-image-2",
      ];

      for (const model of preferredModels) {
        try {
          const openAiRes = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              prompt: enhancedPrompt,
              n: 1,
              size: "1024x1024",
            }),
          });

          if (openAiRes.ok) {
            const data = await openAiRes.json();
            const item = data.data?.[0];
            const imageUrl = item?.b64_json
              ? `data:image/png;base64,${item.b64_json}`
              : item?.url;

            if (imageUrl) {
              return NextResponse.json({
                success: true,
                model,
                imageUrl,
                usage: data.usage,
                costEstimateUsd: 0.024,
                message: `Real coloring page line-art generated with OpenAI ${model}`,
              });
            }
          } else {
            const errBody = await openAiRes.text();
            console.warn(`OpenAI ${model} request error:`, openAiRes.status, errBody);
          }
        } catch (apiErr) {
          console.warn(`OpenAI ${model} call error:`, apiErr);
        }
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
