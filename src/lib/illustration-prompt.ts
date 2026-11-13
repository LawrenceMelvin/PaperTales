export interface IllustrationPromptOptions {
  isCover?: boolean;
  coverColorScheme?: string;
}

export function getCleanIllustrationPrompt(
  rawPrompt: string,
  characterTraits?: string,
  artStyle?: string,
  interiorColor?: "black_and_white" | "standard_color",
  options?: IllustrationPromptOptions
): string {
  const base = rawPrompt || "a friendly child explorer on an adventure";
  const traits = characterTraits ? `, character details: ${characterTraits}` : "";
  const isCover = Boolean(options?.isCover);
  const coverScheme = options?.coverColorScheme;
  const isColor =
    interiorColor === "standard_color" ||
    Boolean(artStyle && /\b(color|colorful|vibrant|watercolor|pastel|painted|digital art|saturated)\b/i.test(artStyle));

  if (isCover) {
    if (coverScheme === "minimal_monochrome" || interiorColor === "black_and_white") {
      return `Book cover centerpiece illustration, square 1:1 full-bleed composition filling the entire frame edge-to-edge with no outer margins or letterboxing. Depict this exact scene faithfully without changing the subject or adding mascots: ${base}${traits}. Style: clean high-contrast monochrome black ink line art on a pure white background. Strictly NO text, NO words, NO letters, NO book title, NO author name, NO typography, NO watermarks anywhere in the image.`;
    }

    const colorBackgroundHint =
      coverScheme === "midnight_black"
        ? "Set on a pure jet-black (#0A0A0C) background matching the scene lighting. "
        : coverScheme === "midnight_glacier"
        ? "Set against a deep midnight slate atmospheric backdrop. "
        : "";
    const styleClause = artStyle ? `Art style: ${artStyle}. ` : "";
    return `Custom book cover centerpiece artwork, square 1:1 full-bleed composition filling the entire frame edge-to-edge with no outer margins or letterboxing. Depict this exact subject, composition, and mood literally without substituting unrelated characters or children's mascots: ${base}${traits}. ${colorBackgroundHint}${styleClause}Strictly NO text, NO words, NO letters, NO book title, NO author name, NO typography, NO watermarks anywhere inside the image.`.trim();
  }

  if (isColor) {
    const styleDesc = artStyle || "playful, colorful digital book illustration";
    return `Book illustration, square 1:1 full-bleed composition filling the entire frame edge-to-edge with no outer margins or letterboxing, vibrant full color, ${styleDesc}, high detail, rich palette, cinematic lighting, ${base}${traits}.`;
  }

  return `Coloring book page outline, square 1:1 full-bleed composition filling the entire frame edge-to-edge, thick continuous bold black outlines, zero shading, pure white background, no gradients, no borders or letterboxing, ${base}${traits}. Strict monochrome black and white line art, ready for coloring with crayons.`;
}
