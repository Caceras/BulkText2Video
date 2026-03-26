import { getGeminiClient } from "../gemini";

export interface CopyResult {
  tagline: string;
  description: string;
}

export async function generateCopy(prompt: string): Promise<CopyResult> {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Based on this brand context: "${prompt}"

Generate brand copy with the following format. Respond ONLY with valid JSON, no markdown:
{
  "tagline": "A short, catchy tagline (max 10 words)",
  "description": "A compelling brand description (2-3 sentences)"
}`,
          },
        ],
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      tagline: parsed.tagline || "No tagline generated",
      description: parsed.description || "No description generated",
    };
  } catch {
    return {
      tagline: text.slice(0, 100),
      description: text,
    };
  }
}
