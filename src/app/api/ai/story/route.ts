import { NextRequest, NextResponse } from "next/server";
import { BookPage, BookProject, CharacterAnchor } from "@/types/book";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      authorName = "Little Author",
      targetAge = "4-8",
      genre = "coloring_book",
      characterName = "Barnaby",
      characterType = "Golden Retriever Puppy",
      characterTraits = ["Wearing a cozy red scarf", "Floppy ears", "Curious tail wag"],
      pageCount = 6,
    } = body;

    const character: CharacterAnchor = {
      name: characterName,
      type: characterType,
      traits: Array.isArray(characterTraits) ? characterTraits : [characterTraits],
    };

    // Preset prompts mapped to chapters ensuring character anchor consistency
    const chapterThemes = [
      {
        title: "The Big Morning Discovery",
        story: `${character.name} the ${character.type} woke up with excitement! Today was the day to explore the Enchanted Whispering Woods.`,
        scene: `${character.name} packing a tiny explorer backpack next to a sunny bedroom window with playful butterflies.`,
      },
      {
        title: "Into the Greenwood Path",
        story: `With cheerful paws, ${character.name} trotted down the winding stone path bordered by singing bluebells.`,
        scene: `${character.name} crossing a charming wooden bridge over a babbling brook with friendly frogs watching.`,
      },
      {
        title: "The Gentle Giant Owl",
        story: `High in an ancient oak tree, Professor Hoot flapped his grand feathered wings and offered a magic brass compass.`,
        scene: `${character.name} looking up at a wise giant owl perched on a twisted tree branch holding a glowing star map.`,
      },
      {
        title: "The Secret Crystal Meadow",
        story: `The compass guided ${character.name} to a hidden clearing where giant crystal blossoms hummed like musical wind chimes.`,
        scene: `${character.name} happily sniffing sparkling giant geometric flower petals surrounded by dancing fireflies.`,
      },
      {
        title: "A Shared Picnic with Friends",
        story: `Soon, woodland bunnies and gentle hedgehogs joined for a merry feast of sweet honey biscuits.`,
        scene: `${character.name} sitting on a checkered picnic blanket sharing sweet treats with two tiny rabbits under a mushroom cap.`,
      },
      {
        title: "Sweet Dreams Under Starlight",
        story: `As twilight painted the sky with silver stars, ${character.name} curled up warmly, dreaming of tomorrow's new grand adventure.`,
        scene: `${character.name} fast asleep on a cloud of soft clover under a smiling crescent moon and constellation stars.`,
      },
    ];

    const pages: BookPage[] = [];

    // Build pages based on requested page count
    const count = Math.min(Math.max(pageCount, 4), 12);
    for (let i = 0; i < count; i++) {
      const theme = chapterThemes[i % chapterThemes.length];
      const pageTitle = `${theme.title}`;
      const anchorSummary = `${character.name} (a ${character.type}, ${character.traits.join(", ")})`;
      
      pages.push({
        pageNumber: i + 1,
        title: pageTitle,
        storyText: theme.story,
        imagePrompt: `Clean, continuous black-and-white vector coloring page outline for children. High contrast line art, thick clear borders, zero shading, white background. Depicting: ${anchorSummary} in the scene: ${theme.scene}`,
        imageUrl: `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60`,
      });
    }

    const bookProject: BookProject = {
      id: `book_${Date.now().toString(36)}`,
      title: `${character.name}'s Big Adventure in the Magic Forest`,
      subtitle: `A Personalized AI Coloring Storybook`,
      authorName: authorName,
      genre: genre,
      targetAge: targetAge,
      character: character,
      pages: pages,
      pageCount: pages.length,
      format: {
        trimSize: "8.5x8.5",
        binding: "saddle_stitch",
        interiorColor: "black_and_white",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, book: bookProject });
  } catch (error: any) {
    console.error("Error generating book story:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate book" },
      { status: 500 }
    );
  }
}
