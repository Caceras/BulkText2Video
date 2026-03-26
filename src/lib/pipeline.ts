import path from "path";
import fs from "fs/promises";
import { Job, CombinationResult } from "./types";
import { expandCombinations } from "./template";
import { getJob, updateJob } from "./store";
import { generateImage } from "./generators/image";
import { generateCopy } from "./generators/copy";
import { generateVideo } from "./generators/video";
import { generateVoiceover, generateMusic, generateSoundEffect, generateDialogue } from "./generators/audio";

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

export async function runPipeline(jobId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);

  updateJob(jobId, { status: "processing" });

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

  let referenceImagePath: string | undefined;
  if (job.config.referenceImage) {
    referenceImagePath = path.join(process.cwd(), "public", job.config.referenceImage);
  }

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

          // --- Image ---
          if (job.config.assetTypes.images) {
            try {
              const imgPath = await generateImage(combo.expandedPrompt, comboDir, referenceImagePath);
              combo.assets.image = toPublicPath(imgPath);
            } catch (err) {
              console.error(`Image generation failed for combo ${combo.index}:`, err);
            }
          }

          // --- Copy ---
          if (job.config.assetTypes.copy) {
            try {
              combo.assets.copy = await generateCopy(combo.expandedPrompt);
            } catch (err) {
              console.error(`Copy generation failed for combo ${combo.index}:`, err);
            }
          }

          // --- Video ---
          if (job.config.assetTypes.video) {
            try {
              const videoPath = await generateVideo(combo.expandedPrompt, comboDir);
              combo.assets.video = toPublicPath(videoPath);
            } catch (err) {
              console.error(`Video generation failed for combo ${combo.index}:`, err);
            }
          }

          // --- Voiceover ---
          if (job.config.assetTypes.voiceover) {
            try {
              const voiceText = combo.assets.copy?.tagline
                ? `${combo.assets.copy.tagline}. ${combo.assets.copy.description}`
                : combo.expandedPrompt;
              const audioPath = await generateVoiceover(
                voiceText,
                comboDir,
                job.config.audioSettings?.voiceover
              );
              combo.assets.voiceover = toPublicPath(audioPath);
            } catch (err) {
              console.error(`Voiceover generation failed for combo ${combo.index}:`, err);
            }
          }

          // --- Music ---
          if (job.config.assetTypes.music) {
            try {
              const musicPath = await generateMusic(
                combo.expandedPrompt,
                comboDir,
                job.config.audioSettings?.music
              );
              combo.assets.music = toPublicPath(musicPath);
            } catch (err) {
              console.error(`Music generation failed for combo ${combo.index}:`, err);
            }
          }

          // --- Sound Effect ---
          if (job.config.assetTypes.soundEffect) {
            try {
              const sfxPath = await generateSoundEffect(
                combo.expandedPrompt,
                comboDir,
                job.config.audioSettings?.soundEffect
              );
              combo.assets.soundEffect = toPublicPath(sfxPath);
            } catch (err) {
              console.error(`SFX generation failed for combo ${combo.index}:`, err);
            }
          }

          // --- Dialogue ---
          if (job.config.assetTypes.dialogue) {
            try {
              const script =
                job.config.audioSettings?.dialogue?.scriptTemplate || combo.expandedPrompt;
              const dialoguePath = await generateDialogue(
                script,
                comboDir,
                job.config.audioSettings?.dialogue
              );
              combo.assets.dialogue = toPublicPath(dialoguePath);
            } catch (err) {
              console.error(`Dialogue generation failed for combo ${combo.index}:`, err);
            }
          }

          // Save copy as JSON
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
