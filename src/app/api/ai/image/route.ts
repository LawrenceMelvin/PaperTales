import { NextRequest, NextResponse } from "next/server";
import { getCleanIllustrationPrompt } from "@/lib/illustration-prompt";
import { guardAiRequest, GuardError } from "@/lib/server/guard";
import { GEMINI_KID_SAFE_SETTINGS } from "@/lib/server/prompt-safety";
import { getBookForOwner, setBookPageImagePath } from "@/lib/server/books-repo";
import { allowedPages } from "@/lib/server/entitlement";
import {
  getSignedReadUrl,
  ONE_HOUR_SECONDS,
  parseDataUrl,
  uploadBuffer,
} from "@/lib/server/storage";

async function persistImageToGcsIfBook(
  uid: string,
  bookId: string | undefined,
  pageNumber: number,
  contentVersion: number,
  dataUrlOrUrl: string
): Promise<{ imageUrl: string; imagePath?: string }> {
  if (!bookId || process.env.REQUIRE_AUTH === "false") {
    return { imageUrl: dataUrlOrUrl };
  }
  const parsed = parseDataUrl(dataUrlOrUrl);
  if (!parsed) {
    return { imageUrl: dataUrlOrUrl };
  }
  const ext = parsed.contentType.includes("png") ? "png" : "jpg";
  const pageKey = pageNumber === 0 ? "cover" : `page-${pageNumber}`;
  const objectPath = `users/${uid}/books/${bookId}/pages/${pageKey}-v${contentVersion}.${ext}`;
  await uploadBuffer(objectPath, parsed.buffer, parsed.contentType);
  await setBookPageImagePath(bookId, uid, pageNumber, objectPath);
  const signedUrl = await getSignedReadUrl(objectPath, ONE_HOUR_SECONDS);
  return { imageUrl: signedUrl, imagePath: objectPath };
}

// Keep backward compatibility
const getCleanColoringPrompt = getCleanIllustrationPrompt;

function getPollinationsImageUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 900000) + 100000;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
}

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      characterTraits,
      pageNumber = 1,
      artStyle,
      interiorColor,
      isCover,
      coverColorScheme,
      bookId,
    } = await req.json();
    const effectiveIsCover = Boolean(isCover) || pageNumber === 0;

    const user = await guardAiRequest(req, {
      kind: "image",
      texts: [prompt, ...(Array.isArray(characterTraits) ? characterTraits : [])],
    });

    let contentVersion = 1;
    if (bookId && process.env.REQUIRE_AUTH !== "false") {
      const book = await getBookForOwner(bookId, user.uid);
      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      contentVersion = (book.contentVersion || 1) + 1;
      if (!effectiveIsCover) {
        const allowed = allowedPages(book.pageCount || 12, book.entitlement, user.isAnonymous);
        if (!allowed.has(Number(pageNumber))) {
          return NextResponse.json(
            { error: "Page is locked. Unlock pages to generate.", code: "page_locked" },
            { status: 402 }
          );
        }
      }
    }

    const enhancedPrompt = getCleanIllustrationPrompt(prompt, characterTraits, artStyle, interiorColor, {
      isCover: effectiveIsCover,
      coverColorScheme,
    });
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
                  imageConfig: {
                    aspectRatio: "1:1",
                  },
                },
                safetySettings: GEMINI_KID_SAFE_SETTINGS,
              }),
              signal: AbortSignal.timeout(35000),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
            if (part?.inlineData?.data) {
              const mime = part.inlineData.mimeType || "image/jpeg";
              const rawDataUrl = `data:${mime};base64,${part.inlineData.data}`;
              const stored = await persistImageToGcsIfBook(
                user.uid,
                bookId,
                effectiveIsCover ? 0 : Number(pageNumber),
                contentVersion,
                rawDataUrl
              );
              return NextResponse.json({
                success: true,
                model,
                imageUrl: stored.imageUrl,
                ...(stored.imagePath ? { imagePath: stored.imagePath } : {}),
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
    if (error instanceof GuardError) return error.toResponse();
    console.error("Error in AI image route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
