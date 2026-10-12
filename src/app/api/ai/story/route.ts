import { NextRequest, NextResponse } from "next/server";
import { BookPage, BookProject, CharacterAnchor } from "@/types/book";

interface ChapterTemplate {
  title: string;
  story: (name: string, type: string) => string;
  scene: (name: string, type: string) => string;
}

const GENRE_CHAPTER_TEMPLATES: Record<string, ChapterTemplate[]> = {
  coloring_book: [
    {
      title: "The Big Morning Discovery",
      story: (name, type) => `${name} the ${type} woke up with excitement! Today was the day to explore the Enchanted Whispering Woods.`,
      scene: (name, type) => `${name} packing a tiny explorer backpack next to a sunny bedroom window with playful butterflies.`,
    },
    {
      title: "Into the Greenwood Path",
      story: (name, type) => `With cheerful paws, ${name} trotted down the winding stone path bordered by singing bluebells.`,
      scene: (name, type) => `${name} crossing a charming wooden bridge over a babbling brook with friendly frogs watching.`,
    },
    {
      title: "The Gentle Giant Owl",
      story: (name, type) => `High in an ancient oak tree, Professor Hoot flapped his grand feathered wings and offered a magic brass compass.`,
      scene: (name, type) => `${name} looking up at a wise giant owl perched on a twisted tree branch holding a glowing star map.`,
    },
    {
      title: "The Secret Crystal Meadow",
      story: (name, type) => `The compass guided ${name} to a hidden clearing where giant crystal blossoms hummed like musical wind chimes.`,
      scene: (name, type) => `${name} happily sniffing sparkling giant geometric flower petals surrounded by dancing fireflies.`,
    },
    {
      title: "A Shared Picnic with Friends",
      story: (name, type) => `Soon, woodland bunnies and gentle hedgehogs joined for a merry feast of sweet honey biscuits.`,
      scene: (name, type) => `${name} sitting on a checkered picnic blanket sharing sweet treats with two tiny rabbits under a mushroom cap.`,
    },
    {
      title: "Sweet Dreams Under Starlight",
      story: (name, type) => `As twilight painted the sky with silver stars, ${name} curled up warmly, dreaming of tomorrow's new grand adventure.`,
      scene: (name, type) => `${name} fast asleep on a cloud of soft clover under a smiling crescent moon and constellation stars.`,
    },
  ],
  memory_book: [
    {
      title: "The Day We First Welcomed You",
      story: (name, type) => `From the moment you entered our lives, ${name} the sweet ${type}, every corner of our home filled with pure joy and laughter.`,
      scene: (name, type) => `${name} arriving in a cozy doorway surrounded by loving family hands, welcome ribbons, and squeaky toys.`,
    },
    {
      title: "Little Steps & Big Discoveries",
      story: (name, type) => `Do you remember when ${name} took those first wobbly steps? Every leaf in the backyard was an incredible treasure!`,
      scene: (name, type) => `${name} exploring the green garden lawn, playfully chasing a floating autumn dandelion leaf.`,
    },
    {
      title: "Sunny Days at the Beach",
      story: (name, type) => `Golden sunshine, crashing salty waves, and sandy paws. We built sandcastles together and raced the incoming tide until sunset.`,
      scene: (name, type) => `${name} happily splashing in shallow ocean waves beside a towering sandcastle with seashell flags.`,
    },
    {
      title: "The Kitchen Baking Adventure",
      story: (name, type) => `Flour was on our noses and batter was on our aprons! ${name} kept loyal watch as delicious holiday treats baked in the warm oven.`,
      scene: (name, type) => `${name} sitting beside a rustic kitchen counter with bowls, cookie cutters, and cheerful flour footprints.`,
    },
    {
      title: "The Grand Birthday Surprise",
      story: (name, type) => `Party hats, singing loved ones, and the biggest celebration! We blew out the candles and made a wish for a lifetime of hugs.`,
      scene: (name, type) => `${name} wearing a celebratory party hat in front of a layered birthday cake with glowing candles and balloons.`,
    },
    {
      title: "Treasured Forever in Our Hearts",
      story: (name, type) => `No matter how many seasons pass, every memory of ${name} is etched in gold within our family's storybook lane.`,
      scene: (name, type) => `${name} nestled warmly on a plush armchair surrounded by framed family photos and cozy heart quilts.`,
    },
  ],
  math_book: [
    {
      title: "The 3 Golden Keys to Number Castle",
      story: (name, type) => `${name} stood before Number Castle. The door had 3 locks! Can you count the 3 golden keys hanging on the wall? (1... 2... 3!)`,
      scene: (name, type) => `${name} standing before a whimsical castle gate with 3 distinctly numbered giant keys (1, 2, 3) to count and color.`,
    },
    {
      title: "Crossing the 5 Stepping Stones",
      story: (name, type) => `To cross the whispering river, ${name} must hop across 5 geometric stones: Circle, Triangle, Square, Pentagon, and Star!`,
      scene: (name, type) => `${name} hopping on 5 numbered floating geometric stepping stones over a calm river with water lilies.`,
    },
    {
      title: "Counting 8 Starlight Crystals",
      story: (name, type) => `Inside the cavern, ${name} discovered crystal stalactites. "Look! 4 purple crystals + 4 blue crystals = 8 radiant gems in total!"`,
      scene: (name, type) => `${name} pointing a flashlight at 8 sparkling crystal clusters grouped in sets of four on a rocky cave ceiling.`,
    },
    {
      title: "The Clock Tower Pattern Riddle",
      story: (name, type) => `Tick-tock! The clock showed 3 o'clock, then 6 o'clock, then 9 o'clock. Can ${name} figure out what comes next? It's 12!`,
      scene: (name, type) => `${name} looking up at a cheerful giant steampunk clock face with gears and Roman numerals to trace and color.`,
    },
    {
      title: "The 10 Balloon Sky Bridge",
      story: (name, type) => `Up into the sky! ${name} counted 10 helium balloons. If 2 balloons are yellow and 8 are blue, how many balloons carry us?`,
      scene: (name, type) => `${name} floating gently in a basket held by 10 numbered round balloons floating through fluffy cartoon clouds.`,
    },
    {
      title: "The Math Quest Champion Ribbon",
      story: (name, type) => `You did it! ${name} solved every puzzle with sharp logic and counting mastery. You are an official Math Explorer Champion!`,
      scene: (name, type) => `${name} standing proudly on a 1st place podium holding a giant number ribbon and graduation medal.`,
    },
  ],
  science_book: [
    {
      title: "Blast Off: Leaving Earth's Atmosphere",
      story: (name, type) => `3... 2... 1... Liftoff! ${name} soared through Earth's troposphere into outer space, where gravity drops to zero!`,
      scene: (name, type) => `${name} in an astronaut space suit peering out a rocket shuttle window watching planet Earth curve below.`,
    },
    {
      title: "The Rings of Giant Saturn",
      story: (name, type) => `Whizzing through the solar system, ${name} marvelled at Saturn. Did you know its rings are made of billions of chunks of ice and rock?`,
      scene: (name, type) => `${name} waving from a spacecraft near giant ringed planet Saturn with shooting stars and craters.`,
    },
    {
      title: "Deep Sea Bioluminescence",
      story: (name, type) => `Diving deep into the twilight ocean trenches, ${name} met jellyfish and anglerfish that produce their own natural glowing light!`,
      scene: (name, type) => `${name} in a yellow submersible sub witnessing glowing jellyfish, sea turtles, and coral reefs.`,
    },
    {
      title: "Photosynthesis: How Plants Eat Sunshine",
      story: (name, type) => `In the ancient rainforest, ${name} learned the superpower of leaves: converting sunlight, water, and air into sweet oxygen for us to breathe!`,
      scene: (name, type) => `${name} examining an oversized tropical leaf with magnifying glass showing veins, water drops, and sunshine beams.`,
    },
    {
      title: "Fossil Dig: Dinosaurs of the Mesozoic",
      story: (name, type) => `Armed with a gentle brush and magnifying lens, ${name} uncovered the skeleton of a mighty Stegosaurus preserved in sandstone for 150 million years!`,
      scene: (name, type) => `${name} digging in an archaeological sand quarry brushing the skeleton plates of a friendly Stegosaurus fossil.`,
    },
    {
      title: "Junior Scientist of the Universe",
      story: (name, type) => `From the tiniest atom to the vastest galaxy, ${name} discovered that curious questions are the superpower of all great scientists!`,
      scene: (name, type) => `${name} in a laboratory with telescope, microscope, beakers, and star charts, holding a Junior Scientist badge.`,
    },
  ],
};

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
      referenceImageUrl,
      pageCount = 6,
    } = body;

    const character: CharacterAnchor = {
      name: characterName,
      type: characterType,
      traits: Array.isArray(characterTraits) ? characterTraits : [characterTraits],
    };

    // Pick genre templates or fallback to coloring_book
    const templates = GENRE_CHAPTER_TEMPLATES[genre] || GENRE_CHAPTER_TEMPLATES.coloring_book;

    const pages: BookPage[] = [];
    const count = Math.min(Math.max(pageCount, 4), 60);

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const pageTitle = template.title;
      const anchorSummary = `${character.name} (${character.type}, with ${character.traits.join(", ")})`;
      const storyText = template.story(character.name, character.type);
      const sceneDesc = template.scene(character.name, character.type);

      const genrePromptPrefix =
        genre === "math_book"
          ? "Interactive educational math coloring sheet for kids. Clean vector line-art, numbered items to count, crisp bold outlines, zero shading:"
          : genre === "science_book"
          ? "Educational science illustration line-art for kids. Clear scientific structures, vector outline, high contrast, zero shading:"
          : genre === "memory_book"
          ? "Heartwarming family keepsake storybook line-art. Clean black-and-white vector coloring outlines, charming expressive style:"
          : "Clean, continuous black-and-white vector coloring page outline for children. High contrast line art, thick clear borders, zero shading, white background:";

      pages.push({
        pageNumber: i + 1,
        title: pageTitle,
        storyText: storyText,
        imagePrompt: `${genrePromptPrefix} Depicting ${anchorSummary} in the scene: ${sceneDesc}`,
        imageUrl: `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=60`,
      });
    }

    const genreTitles: Record<string, { title: string; subtitle: string }> = {
      coloring_book: {
        title: `${character.name}'s Big Adventure in the Magic Forest`,
        subtitle: `A Personalized AI Coloring Storybook`,
      },
      memory_book: {
        title: `${character.name}'s Precious Memories: A Family Storybook`,
        subtitle: `Heartwarming Milestones & Keepsake Illustrated Chapters`,
      },
      math_book: {
        title: `${character.name}'s Math & Logic Quest`,
        subtitle: `Counting Riddles, Shape Puzzles & Interactive Coloring Adventures`,
      },
      science_book: {
        title: `${character.name}'s Science & Nature Explorer`,
        subtitle: `Space, Dinosaurs, Deep Ocean & Wonder-Filled Discovery Guide`,
      },
    };

    const bookTitleData = genreTitles[genre] || genreTitles.coloring_book;

    const bookProject: BookProject = {
      id: `book_${Date.now().toString(36)}`,
      title: bookTitleData.title,
      subtitle: bookTitleData.subtitle,
      authorName: authorName,
      genre: genre,
      targetAge: targetAge,
      character: character,
      referenceImageUrl: referenceImageUrl || undefined,
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
