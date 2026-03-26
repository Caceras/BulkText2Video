import path from "path";
import fs from "fs/promises";
import { Job, CombinationResult } from "./types";
import { expandCombinations } from "./template";
import { getJob, updateJob } from "./store";
import { generateImage } from "./generators/image";
import { generateCopy } from "./generators/copy";
import { generateVideo } from "./generators/video";
import { generateVoiceover } from "./generators/audio";

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

/**
 * Run the full generation pipeline for a job.
 * Expands template variables, then runs selected generators for each combination.
 */
export async function runPipeline(jobId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);

  updateJob(jobId, { status: "processing" });

  // Expand template into all combinations
  const expanded = expandCombinations(job.config.promptTemplate, job.config.variables);

  const combinations: CombinationResult[] = expanded.map((item, index) => ({
    index,
    expandedPrompt: item.expandedPrompt,
    variableValues: item.variableValues,
    assets: {},
    status: "pending",
  }));

  updateJob(jobId, {
    combinations,
    totalCombinations: combinations.length,
    completedCombinations: 0,
  });

  // Resolve reference image path
  let referenceImagePath: string | undefined;
  if (job.config.referenceImage) {
    referenceImagePath = path.join(process.cwd(), "public", job.config.referenceImage);
  }

  // Process each combination with concurrency limit
  const CONCURRENCY = 2;
  let completedCount = 0;

  for (let i = 0; i < combinations.length; i += CONCURRENCY) {
    const batch = combinations.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (combo) => {
        const comboDir = path.join(GENERATED_DIR, jobId, String(combo.index));
        await fs.mkdir(comboDir, { recursive: true });

        try {
          combo.status = "processing";
          updateJobCombinations(jobId, combinations, completedCount);

          // Run selected generators
          if (job.config.assetTypes.images) {
            try {
              const imgPath = await generateImage(combo.expandedPrompt, comboDir, referenceImagePath);
              combo.assets.image = toPublicPath(imgPath);
            } catch (err) {
              console.error(`Image generation failed for combo ${combo.index}:`, err);
            }
          }

          if (job.config.assetTypes.copy) {
            try {
              combo.assets.copy = await generateCopy(combo.expandedPrompt);
            } catch (err) {
              console.error(`Copy generation failed for combo ${combo.index}:`, err);
            }
          }

          if (job.config.assetTypes.video) {
            try {
              const videoPath = await generateVideo(combo.expandedPrompt, comboDir);
              combo.assets.video = toPublicPath(videoPath);
            } catch (err) {
              console.error(`Video generation failed for combo ${combo.index}:`, err);
            }
          }

          if (job.config.assetTypes.audio) {
            try {
              // Use generated copy as voiceover text, or the expanded prompt
              const voiceText = combo.assets.copy?.tagline
                ? `${combo.assets.copy.tagline}. ${combo.assets.copy.description}`
                : combo.expandedPrompt;
              const audioPath = await generateVoiceover(voiceText, comboDir, job.config.audioSettings);
              combo.assets.audio = toPublicPath(audioPath);
            } catch (err) {
              console.error(`Audio generation failed for combo ${combo.index}:`, err);
            }
          }

          // Save copy as JSON file too
          if (combo.assets.copy) {
            const copyPath = path.join(comboDir, "copy.json");
            await fs.writeFile(copyPath, JSON.stringify(combo.assets.copy, null, 2));
          }

          combo.status = "completed";
        } catch (err) {
          combo.status = "failed";
          combo.error = err instanceof Error ? err.message : String(err);
        }

        completedCount++;
        updateJobCombinations(jobId, combinations, completedCount);
      })
    );
  }

  // Final status
  const allFailed = combinations.every((c) => c.status === "failed");
  updateJob(jobId, {
    status: allFailed ? "failed" : "completed",
    combinations,
    completedCombinations: completedCount,
    completedAt: new Date().toISOString(),
  });
}

function updateJobCombinations(
  jobId: string,
  combinations: CombinationResult[],
  completed: number
): void {
  updateJob(jobId, { combinations: [...combinations], completedCombinations: completed });
}

function toPublicPath(absolutePath: string): string {
  const publicDir = path.join(process.cwd(), "public");
  return absolutePath.replace(publicDir, "").replace(/\\/g, "/");
}
