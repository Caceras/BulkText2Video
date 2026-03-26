import { getElevenLabsClient } from "../elevenlabs";

export interface PodcastConfig {
  text: string;
  title?: string;
  hostVoiceId?: string;
  guestVoiceId?: string;
}

export async function createPodcast(config: PodcastConfig) {
  const client = getElevenLabsClient();

  const result = await client.studio.createPodcast({
    modelId: "eleven_multilingual_v2",
    mode: {
      type: "conversation",
      conversation: {
        hostVoiceId: config.hostVoiceId || "JBFqnCBsd6RMkjVDRZzb",
        guestVoiceId: config.guestVoiceId || "Aw4FAjKCGjjNkVhN1Xmq",
      },
    },
    source: {
      type: "text",
      text: config.text,
    },
  });

  return result;
}
