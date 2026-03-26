import { getElevenLabsClient } from "../elevenlabs";
import fs from "fs/promises";
import path from "path";
import type { VoiceSettings, MusicSettings, DialogueSettings, SoundEffectSettings } from "../types";

async function responseToBuffer(response: unknown): Promise<Buffer> {
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
  settings?: VoiceSettings
): Promise<string> {
  const client = getElevenLabsClient();

  const audio = await client.textToSpeech.convert(
    settings?.voiceId || "JBFqnCBsd6RMkjVDRZzb",
    {
      text,
      modelId: settings?.modelId || "eleven_multilingual_v2",
      voiceSettings: settings?.stability != null || settings?.similarityBoost != null
        ? {
            stability: settings?.stability ?? 0.5,
            similarityBoost: settings?.similarityBoost ?? 0.75,
          }
        : undefined,
    }
  );

  const buffer = await responseToBuffer(audio);
  const filename = "voiceover.mp3";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}

export async function generateMusic(
  prompt: string,
  outputDir: string,
  settings?: MusicSettings
): Promise<string> {
  const client = getElevenLabsClient();

  const fullPrompt = settings?.genre
    ? `${settings.genre} music for: ${settings.prompt || prompt}`
    : settings?.prompt || prompt;

  const response = await client.music.compose({
    prompt: fullPrompt,
    musicLengthMs: settings?.durationMs || 30000,
    forceInstrumental: settings?.instrumental ?? true,
  });

  const buffer = await responseToBuffer(response);
  const filename = "music.mp3";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}

export async function generateDialogue(
  script: string,
  outputDir: string,
  settings?: DialogueSettings
): Promise<string> {
  const client = getElevenLabsClient();

  // Parse script into dialogue inputs
  // Expected format: "Role1: text\nRole2: text\n..."
  const lines = script.split("\n").filter((l) => l.trim());
  const voiceMap = new Map(
    (settings?.voices || []).map((v) => [v.role.toLowerCase(), v.voiceId])
  );

  // Default voices for roles without explicit mapping
  const defaultVoices = [
    "JBFqnCBsd6RMkjVDRZzb", // George
    "Aw4FAjKCGjjNkVhN1Xmq", // Another voice
  ];

  const inputs = lines.map((line, i) => {
    const colonIdx = line.indexOf(":");
    let role = "Speaker";
    let text = line;
    if (colonIdx > 0) {
      role = line.slice(0, colonIdx).trim();
      text = line.slice(colonIdx + 1).trim();
    }
    const voiceId =
      voiceMap.get(role.toLowerCase()) || defaultVoices[i % defaultVoices.length];
    return { text, voiceId };
  });

  if (inputs.length === 0) {
    throw new Error("No dialogue lines to generate");
  }

  const response = await client.textToDialogue.convert({ inputs });

  const buffer = await responseToBuffer(response);
  const filename = "dialogue.mp3";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}

export async function generateSoundEffect(
  description: string,
  outputDir: string,
  settings?: SoundEffectSettings
): Promise<string> {
  const client = getElevenLabsClient();

  const response = await client.textToSoundEffects.convert({
    text: settings?.description || description,
    durationSeconds: settings?.durationSeconds || 5,
  });

  const buffer = await responseToBuffer(response);
  const filename = "sfx.mp3";
  const outputPath = path.join(outputDir, filename);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}
