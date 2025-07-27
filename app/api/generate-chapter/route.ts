import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://api.studio.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { title, entry, storyTone, narrator } = await req.json();
    if (!entry || !storyTone || !narrator) {
      return NextResponse.json(
        { error: "Missing required fields: entry, storyTone, narrator" },
        { status: 400 }
      );
    }

    const prompt = `
    You are a skilled storyteller AI. Transform the following journal entry into an epic narrative chapter using the Hero's Journey structure.

    PARAMETERS:
    - Story Tone: ${storyTone}
    - Narrator Persona: ${narrator}
    - Original Title: ${title || "Untitled Entry"}

    NARRATOR PERSONAS:
    - wise-sage: Ancient wisdom, poetic, mentor-like.
    - cheeky-bard: Playful, witty, light-hearted commentary.
    - stoic-chronicler: Formal, historian-like.

    INSTRUCTIONS:
    1. Rewrite the journal entry (also reference the title to generate with good accuracy) as a compelling narrative chapter (2–4 paragraphs).
    2. Use the specified narrator persona's voice throughout.
    3. Apply the chosen story tone consistently.
    4. Structure it with a clear beginning, middle, and end.
    5. Create a vivid chapter title.
    6. Write a concise 2–3 sentence summary.
    7. Strictly use the provided information such as the title and entry content. Use all people, places, and events mentioned in the entry.
    8. You can be creative with the narrative but must stay true to the essence of the journal entry (for example, if the entry described a task that was accomplished, you can write the task as a monster).

    Return ONLY valid JSON. Do not include any text before or after the JSON. Do not include code fences or commentary.
    {
      "title": "An engaging chapter title (no markdown characters like * or ** allowed)",
      "summary": "A 2–3 sentence summary (no markdown characters like * or ** allowed)",
      "narrative": "The full narrative (2–4 paragraphs), written in rich Markdown format. Escape all newlines as \\n and escape quotes inside text. The string must be JSON-safe. Use # headings, ## headings, ### headings, bullet points, icons, **bold**, and *italic* formatting as needed."
    }

    JOURNAL ENTRY:
    ${entry}
    `;

    const completion = await client.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
      temperature: 0.8,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content received from AI");

    let parsed;
    try {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start === -1 || end === -1)
        throw new Error("No JSON object found in AI response");

      const jsonBlock = content.slice(start, end + 1);
      parsed = JSON.parse(jsonBlock);
    } catch (err) {
      console.error("JSON Parse Error:", err);
      console.error("Raw content:", content);
      throw new Error("Invalid JSON response from AI");
    }

    if (!parsed.title || !parsed.summary || !parsed.narrative) {
      throw new Error("Incomplete response from AI");
    }

    return NextResponse.json({
      title: parsed.title,
      summary: parsed.summary,
      narrative: parsed.narrative,
    });
  } catch (error) {
    console.error("Generate Chapter Error:", error);
    return NextResponse.json(
      { error: "Failed to generate chapter" },
      { status: 500 }
    );
  }
}
