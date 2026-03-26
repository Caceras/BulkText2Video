import { z } from "zod";

// --- Audio Sub-Schemas ---

export const VoiceSettingsSchema = z.object({
  voiceId: z.string().optional(),
  voiceName: z.string().optional(),
  modelId: z.string().optional(),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
});

export const MusicSettingsSchema = z.object({
  prompt: z.string().optional(),
  genre: z.string().optional(),
  durationMs: z.number().min(3000).max(600000).optional(),
  instrumental: z.boolean().optional(),
});

export const DialogueSettingsSchema = z.object({
  voices: z
    .array(
      z.object({
        role: z.string(),
        voiceId: z.string(),
        voiceName: z.string().optional(),
      })
    )
    .optional(),
  scriptTemplate: z.string().optional(),
});

export const SoundEffectSettingsSchema = z.object({
  description: z.string().optional(),
  durationSeconds: z.number().min(1).max(30).optional(),
});

export const AudioSettingsSchema = z.object({
  voiceover: VoiceSettingsSchema.optional(),
  music: MusicSettingsSchema.optional(),
  dialogue: DialogueSettingsSchema.optional(),
  soundEffect: SoundEffectSettingsSchema.optional(),
});

// --- Asset Types ---

export const AssetTypesSchema = z.object({
  images: z.boolean().default(false),
  copy: z.boolean().default(false),
  video: z.boolean().default(false),
  voiceover: z.boolean().default(false),
  music: z.boolean().default(false),
  soundEffect: z.boolean().default(false),
  dialogue: z.boolean().default(false),
});

// --- Job Config ---

export const JobConfigSchema = z.object({
  promptTemplate: z.string().min(1, "Prompt template is required"),
  variables: z.record(z.array(z.string().min(1)).min(1)),
  referenceImage: z.string().optional(),
  assetTypes: AssetTypesSchema,
  audioSettings: AudioSettingsSchema.optional(),
});

export type JobConfig = z.infer<typeof JobConfigSchema>;
export type AssetTypes = z.infer<typeof AssetTypesSchema>;
export type AudioSettings = z.infer<typeof AudioSettingsSchema>;
export type VoiceSettings = z.infer<typeof VoiceSettingsSchema>;
export type MusicSettings = z.infer<typeof MusicSettingsSchema>;
export type DialogueSettings = z.infer<typeof DialogueSettingsSchema>;
export type SoundEffectSettings = z.infer<typeof SoundEffectSettingsSchema>;

// --- Job Types ---

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface CombinationResult {
  index: number;
  expandedPrompt: string;
  variableValues: Record<string, string>;
  assets: {
    image?: string;
    copy?: { tagline: string; description: string };
    video?: string;
    voiceover?: string;
    music?: string;
    soundEffect?: string;
    dialogue?: string;
  };
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export interface Job {
  id: string;
  config: JobConfig;
  status: JobStatus;
  combinations: CombinationResult[];
  totalCombinations: number;
  completedCombinations: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// --- Voice Types (for API responses) ---

export interface VoiceInfo {
  voiceId: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  previewUrl?: string;
}

// --- Agent Types ---

export interface AgentConfig {
  name: string;
  description: string;
  voiceId?: string;
  systemPrompt: string;
  firstMessage?: string;
}
