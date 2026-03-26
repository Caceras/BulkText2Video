import { getGeminiClient } from "../gemini";
import fs from "fs/promises";
import path from "path";

export async function generateImage(
  prompt: string,
  outputDir: string,
  referenceImagePath?: string
): Promise<string> {
  const client = getGeminiClient();

  const contents: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // If reference image provided, include it
  if (referenceImagePath) {
    const imgBuffer = await fs.readFile(referenceImagePath);
    const base64 = imgBuffer.toString("base64");
    const ext = path.extname(referenceImagePath).toLowerCase();
    const mimeType =
      ext === ".png" ? "image/png" :
      ext === ".webp" ? "image/webp" :
      "image/jpeg";

    contents.push({ inlineData: { mimeType, data: base64 } });
  }

  contents.push({ text: prompt });

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ role: "user", parts: contents }],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  // Extract image from response
  const parts = response.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData) {
      const ext = part.inlineData.mimeType?.includes("png") ? ".png" : ".jpg";
      const filename = `image${ext}`;
      const outputPath = path.join(outputDir, filename);
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(outputPath, Buffer.from(part.inlineData.data!, "base64"));
      return outputPath;
    }
  }

  throw new Error("No image generated in response");
}
