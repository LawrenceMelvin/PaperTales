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

    const apiKey = process.env.OPENAI_API_KEY;
    const enhancedPrompt = getCleanIllustrationPrompt(prompt, characterTraits, artStyle, interiorColor);
    const isColor =
      interiorColor === "standard_color" ||
      Boolean(artStyle && /\b(color|colorful|vibrant|watercolor|pastel|painted|digital art|saturated)\b/i.test(artStyle));

    // 1. Try OpenAI GPT-Image-2.5 (Flare / Sunburst) first
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
            console.warn(`OpenAI ${model} request error:`, openAiRes.status, errBody);
          }
        } catch (apiErr) {
          console.warn(`OpenAI ${model} call error:`, apiErr);
        }
      }
    }

    // 2. High-speed Fallback: Google Imagen 3 (via GEMINI_API_KEY)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instances: [{ prompt: enhancedPrompt }],
              parameters: {
                sampleCount: 1,
                aspectRatio: "1:1",
              },
            }),
            signal: AbortSignal.timeout(25000),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const b64 = geminiData.predictions?.[0]?.bytesBase64Encoded;
          const mime = geminiData.predictions?.[0]?.mimeType || "image/jpeg";
          if (b64) {
            return NextResponse.json({
              success: true,
              model: "imagen-3.0-generate-002",
              imageUrl: `data:${mime};base64,${b64}`,
              costEstimateUsd: 0.030,
              message: isColor
                ? "Full-color illustration generated with Google Imagen 3"
                : "Vector line-art generated with Google Imagen 3",
            });
          }
        } else {
          const errBody = await geminiRes.text();
          console.warn("Gemini Imagen request error:", geminiRes.status, errBody);
        }
      } catch (geminiErr) {
        console.warn("Gemini Imagen call error:", geminiErr);
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
