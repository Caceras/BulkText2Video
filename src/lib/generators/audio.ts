import { getElevenLabsClient } from "../elevenlabs";
import fs from "fs/promises";
import path from "path";
import type { AudioSettings } from "../types";

async function responseToBuffer(response: unknown): Promise<Buffer> {
  // Handle various response types from ElevenLabs SDK
  if (Buffer.isBuffer(response)) return response;
  if (response instanceof ArrayBuffer) return Buffer.from(response);
  if (response instanceof Uint8Array) return Buffer.from(response);
  if (typeof response === "object" && response !== null && Symbol.asyncIterator in response) {
    const chunks: Buffer[] = [];
    for await (const chunk of response as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  throw new Error("Unexpected response type from ElevenLabs API");
}

export async function generateVoiceover(
  text: string,
  outputDir: string,
  settings?: AudioSettings
): Promise<string> {
  const client = getElevenLabsClient();

  const audio = await client.textToSpeech.convert(
    settings?.voice || "JBFqnCBsd6RMkjVDRZzb", // default: George
    {
      text,
      modelId: "eleven_multilingual_v2",
    }
  );

  const buffer = await responseToBuffer(audio );
  const filename = "voiceover.mp3";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}

export async function generateMusic(
  prompt: string,
  outputDir: string,
  settings?: AudioSettings
): Promise<string> {
  const client = getElevenLabsClient();

  const genre = settings?.musicGenre || "corporate";
  const fullPrompt = `${genre} music for: ${prompt}`;

  const response = await client.textToSoundEffects.convert({
    text: fullPrompt,
    durationSeconds: 30,
  });

  const buffer = await responseToBuffer(response );
  const filename = "music.mp3";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}

export async function generateSoundEffect(
  description: string,
  outputDir: string
): Promise<string> {
  const client = getElevenLabsClient();

  const response = await client.textToSoundEffects.convert({
    text: description,
    durationSeconds: 5,
  });

  const buffer = await responseToBuffer(response );
  const filename = "sfx.mp3";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}
