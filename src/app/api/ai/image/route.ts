import { NextRequest, NextResponse } from "next/server";

function getCleanIllustrationPrompt(
  rawPrompt: string,
  characterTraits?: string,
  artStyle?: string,
  interiorColor?: "black_and_white" | "standard_color"
): string {
  const base = rawPrompt || "a friendly child explorer on an adventure";
  const traits = characterTraits ? `, character details: ${characterTraits}` : "";
  const isColor =
    interiorColor === "standard_color" ||
    Boolean(artStyle && /\b(color|colorful|vibrant|watercolor|pastel|painted|digital art|saturated)\b/i.test(artStyle));

  if (isColor) {
    const styleDesc = artStyle || "playful, colorful digital children's book illustration";
    return `Children's book illustration, vibrant full color, ${styleDesc}, high detail, rich palette, delightful character expression, cinematic lighting, ${base}${traits}.`;
  }

  return `Children's coloring book page outline, thick continuous bold black outlines, zero shading, pure white background, no gradients, ${base}${traits}. Strict monochrome black and white line art, ready for coloring with crayons.`;
}

// Keep backward compatibility
const getCleanColoringPrompt = getCleanIllustrationPrompt;

function getPollinationsImageUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 900000) + 100000;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, characterTraits, pageNumber, artStyle, interiorColor } = await req.json();

    const enhancedPrompt = getCleanIllustrationPrompt(prompt, characterTraits, artStyle, interiorColor);
    const isColor =
      interiorColor === "standard_color" ||
      Boolean(artStyle && /\b(color|colorful|vibrant|watercolor|pastel|painted|digital art|saturated)\b/i.test(artStyle));

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const hasGemini = Boolean(geminiKey && !geminiKey.startsWith("sb-") && !geminiKey.startsWith("test_"));
    const apiKey = process.env.OPENAI_API_KEY;

    // 1. Google Gemini Native Multimodal Image Generation (Tier-1 Primary, uses GCP credits)
    if (hasGemini) {
      const isCover = pageNumber === 0;
      // Front cover uses high-detail model (gemini-3.1-flash-image); interior pages use ultra-fast 3.28s model (gemini-3.1-flash-lite-image)
      const primaryModel = isCover
        ? (process.env.GEMINI_COVER_IMAGE_MODEL || "gemini-3.1-flash-image")
        : (process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image");
      const secondaryModel = isCover
        ? (process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image")
        : (process.env.GEMINI_COVER_IMAGE_MODEL || "gemini-3.1-flash-image");

      const geminiModelsToTry = [primaryModel, secondaryModel];

      for (const model of geminiModelsToTry) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: enhancedPrompt }] }],
                generationConfig: {
                  responseModalities: ["IMAGE"],
                },
              }),
              signal: AbortSignal.timeout(35000),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
            if (part?.inlineData?.data) {
              const mime = part.inlineData.mimeType || "image/jpeg";
              const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
              return NextResponse.json({
                success: true,
                model,
                imageUrl,
                costEstimateUsd: model.includes("lite") ? 0.0336 : 0.0672,
                message: isColor
                  ? `Full-color illustration generated with Google ${model}`
                  : `Real coloring page line-art generated with Google ${model}`,
              });
            }
          } else {
            const errBody = await geminiRes.text();
            console.warn(`Gemini ${model} request error (${geminiRes.status}):`, errBody.slice(0, 300));
          }
        } catch (geminiErr) {
          console.warn(`Gemini ${model} call error:`, geminiErr);
        }
      }
    }

    // 2. OpenAI GPT-Image-2.5 (Flare / Sunburst) as Tier-2 Failover
    if (apiKey && apiKey.startsWith("sk-")) {
      const preferredModels = [
        process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare",
        "gpt-image-2.5-sunburst",
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
            signal: AbortSignal.timeout(45000),
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
                message: isColor
                  ? `Full-color illustration generated with OpenAI ${model}`
                  : `Real coloring page line-art generated with OpenAI ${model}`,
              });
            }
          } else {
            const errBody = await openAiRes.text();
            console.warn(`OpenAI ${model} request error:`, openAiRes.status, errBody.slice(0, 300));
          }
        } catch (apiErr) {
          console.warn(`OpenAI ${model} call error:`, apiErr);
        }
      }
    }

    // 3. Resilient fallback: Pollinations.ai
    const pollinationsUrl = getPollinationsImageUrl(enhancedPrompt);

    return NextResponse.json({
      success: true,
      model: isColor ? "pollinations-color" : "pollinations-lineart",
      imageUrl: pollinationsUrl,
      message: isColor
        ? "Vibrant full-color illustration generated successfully"
        : "High-contrast vector line-art generated successfully",
    });
  } catch (error: any) {
    console.error("Error in AI image route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
