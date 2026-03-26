import { getGeminiClient } from "../gemini";
import fs from "fs/promises";
import path from "path";

export async function generateVideo(
  prompt: string,
  outputDir: string
): Promise<string> {
  const client = getGeminiClient();

  // Start video generation (async operation)
  let operation = await client.models.generateVideos({
    model: "veo-2.0-generate-001",
    prompt,
    config: {
      numberOfVideos: 1,
      durationSeconds: 6,
      aspectRatio: "16:9",
    },
  });

  // Poll until video is ready
  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    operation = await client.operations.getVideosOperation({ operation });
  }

  const videos = operation.response?.generatedVideos || [];
  if (videos.length === 0) {
    throw new Error("No video generated");
  }

  const video = videos[0];
  if (!video.video?.uri) {
    throw new Error("No video URI in response");
  }

  // Download the video
  const videoResponse = await fetch(video.video.uri);
  const buffer = Buffer.from(await videoResponse.arrayBuffer());

  const filename = "video.mp4";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}
