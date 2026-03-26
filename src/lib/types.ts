import { z } from "zod";

// --- Zod Schemas ---

export const AudioSettingsSchema = z.object({
  voice: z.string().optional(),
  musicGenre: z.string().optional(),
  soundEffectType: z.string().optional(),
});

export const AssetTypesSchema = z.object({
  images: z.boolean().default(false),
  copy: z.boolean().default(false),
  video: z.boolean().default(false),
  audio: z.boolean().default(false),
});

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

// --- Job Types ---

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface CombinationResult {
  index: number;
  expandedPrompt: string;
  variableValues: Record<string, string>;
  assets: {
    image?: string;   // file path
    copy?: { tagline: string; description: string };
    video?: string;   // file path
    audio?: string;   // file path
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
